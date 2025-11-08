import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AdminLayout from '@/layouts/AdminLayout';
import type { Auth, Goal } from '@/types';
import { Head } from '@inertiajs/react';
import { Check, Globe, Lock, Trash2 } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Props {
    auth: Auth;
    goals: Goal[];
}

export default function GoalIndex({ auth, goals: initialGoals }: Props) {
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [newTaskText, setNewTaskText] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
    const [filter, setFilter] = useState<'all' | 'mine' | 'public'>('all');
    const [editingGoalId, setEditingGoalId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [editDueDate, setEditDueDate] = useState('');

    const canCreate = auth.permissions?.goal?.create ?? false;
    const isAdmin = auth.isAdmin ?? false;

    const handleAddGoal = async (e: FormEvent) => {
        e.preventDefault();
        if (!newTaskText.trim()) return;

        try {
            const response = await fetch('/api/goals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title: newTaskText,
                    is_public: false,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setGoals([...goals, data.goal]);
                setNewTaskText('');
            }
        } catch (error) {
            console.error('Error creating goal:', error);
        }
    };

    const handleToggleGoal = async (goalId: number) => {
        try {
            const response = await fetch(`/api/goals/${goalId}/toggle`, {
                method: 'PATCH',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                const data = await response.json();
                setGoals(goals.map((t) => (t.id === goalId ? data.goal : t)));
            }
        } catch (error) {
            console.error('Error toggling goal:', error);
        }
    };

    const handleTogglePublic = async (goalId: number) => {
        const goal = goals.find((t) => t.id === goalId);
        if (!goal) return;

        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    is_public: !goal.is_public,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setGoals(goals.map((t) => (t.id === goalId ? data.goal : t)));
            }
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    const handleDeleteGoal = async (goalId: number) => {
        if (!confirm('Are you sure you want to delete this goal?')) return;

        try {
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
            });

            if (response.ok) {
                setGoals(goals.filter((t) => t.id !== goalId));
            }
        } catch (error) {
            console.error('Error deleting goal:', error);
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
            const response = await fetch(`/api/goals/${goalId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '',
                },
                body: JSON.stringify({
                    title: editTitle,
                    notes: editNotes.trim() || undefined,
                    due_date: editDueDate || undefined,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setGoals(goals.map((t) => (t.id === goalId ? data.goal : t)));
                cancelEditing();
            }
        } catch (error) {
            console.error('Error updating goal:', error);
        }
    };

    // Filter goals
    let filteredGoals = goals;
    if (filter === 'mine') {
        filteredGoals = goals.filter((t) => t.user_id === auth.user.id);
    } else if (filter === 'public') {
        filteredGoals = goals.filter((t) => t.is_public);
    }

    // Split by completion status
    const activeGoals = filteredGoals.filter((t) => !t.completed);
    const completedGoals = filteredGoals.filter((t) => t.completed);
    const displayedGoals = activeTab === 'active' ? activeGoals : completedGoals;

    return (
        <AdminLayout>
            <Head title="Goal Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Goal Management</h1>
                        <p className="text-muted-foreground mt-1">Manage your goals and tasks</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goals.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goals.filter((t) => !t.completed).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goals.filter((t) => t.completed).length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Public</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{goals.filter((t) => t.is_public).length}</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Card */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Goals</CardTitle>

                            {/* Filter Buttons */}
                            <div className="flex gap-2">
                                <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} onClick={() => setFilter('all')}>
                                    All
                                </Button>
                                <Button size="sm" variant={filter === 'mine' ? 'default' : 'outline'} onClick={() => setFilter('mine')}>
                                    My Goals
                                </Button>
                                <Button size="sm" variant={filter === 'public' ? 'default' : 'outline'} onClick={() => setFilter('public')}>
                                    Public
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="mt-4 flex gap-4 border-b">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-1 pb-2 font-medium transition-colors ${
                                    activeTab === 'active' ? 'border-primary text-primary border-b-2' : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Active ({activeGoals.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('completed')}
                                className={`px-1 pb-2 font-medium transition-colors ${
                                    activeTab === 'completed'
                                        ? 'border-primary text-primary border-b-2'
                                        : 'text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                Completed ({completedGoals.length})
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Add New Goal Form */}
                        {canCreate && (
                            <form onSubmit={handleAddGoal} className="mb-6">
                                <div className="flex gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Add a new goal..."
                                        value={newTaskText}
                                        onChange={(e) => setNewTaskText(e.target.value)}
                                        className="flex-1"
                                    />
                                    <Button type="submit">Add Goal</Button>
                                </div>
                            </form>
                        )}

                        {/* Goal List */}
                        <div className="space-y-2">
                            {displayedGoals.length === 0 ? (
                                <div className="text-muted-foreground py-8 text-center">
                                    {activeTab === 'active' ? 'No active goals' : 'No completed goals'}
                                </div>
                            ) : (
                                displayedGoals.map((goal) => {
                                    const isOwner = auth.user.id === goal.user_id;
                                    const canDelete = isAdmin || (isOwner && auth.permissions?.goal?.delete);

                                    return (
                                        <div
                                            key={goal.id}
                                            className="bg-card hover:bg-accent/50 flex items-center gap-3 rounded-lg border p-4 transition-colors"
                                        >
                                            {/* Checkbox */}
                                            <button
                                                onClick={() => handleToggleGoal(goal.id)}
                                                className={`flex-shrink-0 ${isOwner ? 'cursor-pointer' : 'cursor-default opacity-50'}`}
                                                disabled={!isOwner}
                                            >
                                                {goal.completed ? (
                                                    <div className="bg-primary flex h-5 w-5 items-center justify-center rounded-full">
                                                        <Check className="text-primary-foreground h-3.5 w-3.5" />
                                                    </div>
                                                ) : (
                                                    <div className="border-muted-foreground h-5 w-5 rounded-full border-2" />
                                                )}
                                            </button>

                                            {/* Content */}
                                            <div className="min-w-0 flex-1">
                                                {editingGoalId === goal.id ? (
                                                    // Edit Mode
                                                    <div className="space-y-3">
                                                        <Input
                                                            type="text"
                                                            value={editTitle}
                                                            onChange={(e) => setEditTitle(e.target.value)}
                                                            placeholder="Goal title"
                                                            autoFocus
                                                        />
                                                        <textarea
                                                            value={editNotes}
                                                            onChange={(e) => setEditNotes(e.target.value)}
                                                            placeholder="Notes (optional)"
                                                            rows={2}
                                                            className="border-input bg-background focus:ring-ring w-full resize-none rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
                                                        />
                                                        <div className="flex items-center gap-2">
                                                            <Input
                                                                type="date"
                                                                value={editDueDate}
                                                                onChange={(e) => setEditDueDate(e.target.value)}
                                                                className="flex-1"
                                                            />
                                                        </div>
                                                        <div className="flex justify-end gap-2">
                                                            <Button size="sm" variant="outline" onClick={cancelEditing}>
                                                                Cancel
                                                            </Button>
                                                            <Button size="sm" onClick={() => saveEdit(goal.id)} disabled={!editTitle.trim()}>
                                                                Save
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // View Mode
                                                    <div onClick={() => startEditing(goal)} className={isAdmin ? 'cursor-pointer' : ''}>
                                                        <p className={`font-medium ${goal.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                            {goal.title}
                                                        </p>
                                                        {goal.notes && <p className="text-muted-foreground mt-1 text-sm">{goal.notes}</p>}
                                                        {goal.due_date && (
                                                            <p className="text-muted-foreground mt-1 text-xs">
                                                                Due:{' '}
                                                                {new Date(goal.due_date).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                })}
                                                            </p>
                                                        )}
                                                        <div className="mt-1 flex items-center gap-2">
                                                            {goal.user && <span className="text-muted-foreground text-xs">by {goal.user.name}</span>}
                                                            {goal.is_public && (
                                                                <Badge variant="secondary" className="text-xs">
                                                                    Public
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex items-center gap-2">
                                                {/* Public Toggle */}
                                                {isOwner && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleTogglePublic(goal.id)}
                                                        title={goal.is_public ? 'Make Private' : 'Make Public'}
                                                    >
                                                        {goal.is_public ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                                                    </Button>
                                                )}

                                                {/* Delete */}
                                                {canDelete && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteGoal(goal.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
