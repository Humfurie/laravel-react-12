import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { Calendar, Check, Eye, Globe, Lock, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Auth, Goal } from '@/types';

interface GoalWidgetProps {
    className?: string;
}

export default function GoalWidget({ className = '' }: GoalWidgetProps) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const [goals, setGoals] = useState<Goal[]>([]);
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [newTaskText, setNewTaskText] = useState('');
    const [newTaskNotes, setNewTaskNotes] = useState('');
    const [newTaskDueDate, setNewTaskDueDate] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    const isAuthenticated = !!auth?.user;
    const canManageGoals = isAuthenticated && auth.permissions?.goal?.create;
    const isAdmin = auth?.isAdmin ?? false;

    // Fetch goals on component mount
    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/api/goals');
            setGoals(response.data.goals);
        } catch (err) {
            setError('Failed to load goals');
            console.error('Error fetching goals:', err);
        } finally {
            setLoading(false);
        }
    };

    const addTask = async () => {
        if (!newTaskText.trim() || !canManageGoals) return;

        try {
            const response = await axios.post('/api/goals', {
                title: newTaskText,
                notes: newTaskNotes.trim() || undefined,
                due_date: newTaskDueDate || undefined,
                is_public: false,
            });
            setGoals([...goals, response.data.goal]);
            setNewTaskText('');
            setNewTaskNotes('');
            setNewTaskDueDate('');
            setShowAddForm(false);
        } catch (err) {
            console.error('Error creating goal:', err);
            setError('Failed to create goal');
        }
    };

    const toggleTask = async (goalId: number) => {
        if (!canManageGoals) return;

        try {
            const response = await axios.patch(`/api/goals/${goalId}/toggle`);
            setGoals(goals.map((goal) => (goal.id === goalId ? response.data.goal : goal)));
        } catch (err) {
            console.error('Error toggling goal:', err);
            setError('Failed to update goal');
        }
    };

    const deleteTask = async (goalId: number) => {
        const goal = goals.find((t) => t.id === goalId);
        if (!goal) return;

        const canDelete = isAdmin || (goal.user_id === auth.user?.id && canManageGoals);
        if (!canDelete) return;

        try {
            await axios.delete(`/api/goals/${goalId}`);
            setGoals(goals.filter((goal) => goal.id !== goalId));
        } catch (err) {
            console.error('Error deleting goal:', err);
            setError('Failed to delete goal');
        }
    };

    const togglePublic = async (goalId: number) => {
        if (!canManageGoals) return;

        const goal = goals.find((t) => t.id === goalId);
        if (!goal || goal.user_id !== auth.user?.id) return;

        try {
            const response = await axios.patch(`/api/goals/${goalId}`, {
                is_public: !goal.is_public,
            });
            setGoals(goals.map((t) => (t.id === goalId ? response.data.goal : t)));
        } catch (err) {
            console.error('Error updating goal:', err);
            setError('Failed to update goal');
        }
    };

    const startEditing = (goal: Goal) => {
        if (!isAdmin) return;

        setEditingGoalId(goal.id);
        setEditTitle(goal.title);
        setEditNotes(goal.notes || '');
        setEditDueDate(goal.due_date ? new Date(goal.due_date).toISOString().split('T')[0] : '');
    };

    const cancelEditing = () => {
        setEditingGoalId(null);
        setEditTitle('');
        setEditNotes('');
        setEditDueDate('');
    };

    const saveEdit = async (goalId: number) => {
        if (!isAdmin || !editTitle.trim()) return;

        try {
            const response = await axios.patch(`/api/goals/${goalId}`, {
                title: editTitle,
                notes: editNotes.trim() || undefined,
                due_date: editDueDate || undefined,
            });
            setGoals(goals.map((t) => (t.id === goalId ? response.data.goal : t)));
            cancelEditing();
        } catch (err) {
            console.error('Error updating goal:', err);
            setError('Failed to update goal');
        }
    };

    const activeGoals = goals.filter((goal) => !goal.completed);
    const completedGoals = goals.filter((goal) => goal.completed);
    const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

    if (loading) {
        return (
            <div className={`w-full ${className}`}>
                <div className="rounded-2xl border border-white/30 bg-white/60 p-6 shadow-xl backdrop-blur-lg dark:bg-gray-900/60">
                    <div className="text-center text-gray-500">Loading...</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${className}`}>
            <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/60 shadow-xl backdrop-blur-lg dark:bg-gray-900/60">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{isAuthenticated ? 'My Goals' : 'Public Goals'}</h2>
                        {!isAuthenticated && <Eye className="h-5 w-5 text-gray-400" />}
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'active' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Active ({activeGoals.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex-1 py-2 text-sm font-medium transition-colors ${
                                activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            Completed ({completedGoals.length})
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mx-6 mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 p-3">
                        <span className="text-sm text-red-600">{error}</span>
                        <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                {/* Goal List */}
                <div className="max-h-96 overflow-y-auto px-6 pb-4">
                    {displayedGoals.length === 0 ? (
                        <div className="py-8 text-center text-gray-400">{activeTab === 'active' ? 'No active goals' : 'No completed goals'}</div>
                    ) : (
                        <div className="space-y-2">
                            {displayedGoals.map((goal) => {
                                const isOwner = auth.user?.id === goal.user_id;
                                const canDelete = isAdmin || (isOwner && canManageGoals);
                                const canToggle = isOwner && canManageGoals;
                                const canTogglePublic = isOwner && canManageGoals;

                                return (
                                    <div
                                        key={goal.id}
                                        className="group flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        {/* Checkbox */}
                                        <button
                                            onClick={() => toggleTask(goal.id)}
                                            disabled={!canToggle}
                                            className={`mt-0.5 flex-shrink-0 ${canToggle ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                                        >
                                            {goal.completed ? (
                                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
                                                    <Check className="h-3.5 w-3.5 text-white" />
                                                </div>
                                            ) : (
                                                <div className="h-5 w-5 rounded-full border-2 border-gray-300 transition-colors hover:border-blue-500 dark:border-gray-600" />
                                            )}
                                        </button>

                                        {/* Goal Content */}
                                        <div className="min-w-0 flex-1">
                                            {editingGoalId === goal.id ? (
                                                // Edit Mode
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full rounded border border-gray-300 bg-white/50 px-2 py-1 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                                        autoFocus
                                                    />
                                                    <textarea
                                                        value={editNotes}
                                                        onChange={(e) => setEditNotes(e.target.value)}
                                                        placeholder="Notes (optional)"
                                                        rows={2}
                                                        className="w-full resize-none rounded border border-gray-300 bg-white/50 px-2 py-1 text-xs text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="h-3 w-3 text-gray-400" />
                                                        <input
                                                            type="date"
                                                            value={editDueDate}
                                                            onChange={(e) => setEditDueDate(e.target.value)}
                                                            className="flex-1 rounded border border-gray-300 bg-white/50 px-2 py-1 text-xs text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                                        />
                                                    </div>
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => saveEdit(goal.id)}
                                                            disabled={!editTitle.trim()}
                                                            className="rounded bg-blue-500 px-2 py-1 text-xs text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <div onClick={() => startEditing(goal)} className={isAdmin ? 'cursor-pointer' : ''}>
                                                    <p
                                                        className={`text-sm ${
                                                            goal.completed ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-300'
                                                        }`}
                                                    >
                                                        {goal.title}
                                                    </p>
                                                    {goal.notes && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{goal.notes}</p>}
                                                    {goal.due_date && (
                                                        <div className="mt-1 flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-gray-400" />
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                Due:{' '}
                                                                {new Date(goal.due_date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                        </div>
                                                    )}
                                                    {!isOwner && goal.user && <p className="mt-1 text-xs text-gray-400">by {goal.user.name}</p>}
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                                            {/* Public/Private Toggle */}
                                            {isOwner && canTogglePublic && (
                                                <button
                                                    onClick={() => togglePublic(goal.id)}
                                                    className="text-gray-400 transition-colors hover:text-gray-600"
                                                    title={goal.is_public ? 'Make Private' : 'Make Public'}
                                                >
                                                    {goal.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                                </button>
                                            )}

                                            {/* Delete Button */}
                                            {canDelete && (
                                                <button
                                                    onClick={() => deleteTask(goal.id)}
                                                    className="text-gray-400 transition-colors hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Add New Goal (only for authenticated users with permission) */}
                {canManageGoals && (
                    <div className="border-t border-gray-200 px-6 pt-2 pb-6 dark:border-gray-700">
                        {!showAddForm ? (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex w-full items-center gap-2 text-left text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                            >
                                <span className="text-lg">+</span>
                                <span>Add task</span>
                            </button>
                        ) : (
                            <div className="space-y-3">
                                {/* Title Input */}
                                <input
                                    type="text"
                                    placeholder="Task title"
                                    value={newTaskText}
                                    onChange={(e) => setNewTaskText(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                    autoFocus
                                />

                                {/* Description Input */}
                                <textarea
                                    placeholder="Description (optional)"
                                    value={newTaskNotes}
                                    onChange={(e) => setNewTaskNotes(e.target.value)}
                                    rows={2}
                                    className="w-full resize-none rounded-lg border border-gray-300 bg-white/50 px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                />

                                {/* Due Date Input */}
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    <input
                                        type="date"
                                        value={newTaskDueDate}
                                        onChange={(e) => setNewTaskDueDate(e.target.value)}
                                        className="flex-1 rounded-lg border border-gray-300 bg-white/50 px-3 py-1.5 text-sm text-gray-700 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800/50 dark:text-gray-300"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setNewTaskText('');
                                            setNewTaskNotes('');
                                            setNewTaskDueDate('');
                                        }}
                                        className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={addTask}
                                        disabled={!newTaskText.trim()}
                                        className="rounded-lg bg-blue-500 px-3 py-1.5 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Info for non-authenticated users */}
                {!isAuthenticated && (
                    <div className="border-t border-gray-200 px-6 pt-2 pb-6 dark:border-gray-700">
                        <p className="text-center text-xs text-gray-500">Sign in to create and manage your own goals</p>
                    </div>
                )}
            </div>
        </div>
    );
}
