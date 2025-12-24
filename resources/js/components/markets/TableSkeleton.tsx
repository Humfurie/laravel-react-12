import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function TableSkeleton({ rows = 10, columns = 7 }: { rows?: number; columns?: number }) {
    return (
        <Table>
            <TableHeader>
                <TableRow className="border-gray-200 dark:border-gray-700">
                    {Array.from({ length: columns }).map((_, i) => (
                        <TableHead key={i}>
                            <Skeleton className="h-4 w-20" />
                        </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: rows }).map((_, rowIndex) => (
                    <TableRow key={rowIndex} className="border-gray-200 dark:border-gray-700">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <TableCell key={colIndex}>
                                <Skeleton className="h-4 w-full" />
                            </TableCell>
                        ))}
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );
}
