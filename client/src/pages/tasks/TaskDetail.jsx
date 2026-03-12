import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, User, Users } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import TaskComments from './TaskComments';

export default function TaskDetail() {
    const { taskId } = useParams();
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ['task-detail', taskId],
        queryFn: () => api.get(`/tasks/${taskId}`).then(r => r.data),
    });

    const task = data?.task;

    if (isLoading) return <Spinner fullPage />;
    if (!task) return (
        <div className="text-center py-20 text-slate-500">
            <p>Task not found</p>
            <Button onClick={() => navigate('/tasks')} className="mt-4">
                Back to Tasks
            </Button>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => navigate('/tasks')} className="w-fit">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Tasks
            </Button>

            {/* Task info */}
            <Card className="flex flex-col gap-4">
                <div className="flex items-start justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-white text-xl font-bold">{task.title}</h2>
                        {task.description && (
                            <p className="text-slate-400 text-sm mt-1">{task.description}</p>
                        )}
                    </div>
                    <Badge label={task.status} />
                </div>

                <div className="flex flex-wrap gap-2">
                    <Badge label={task.type} />
                    <Badge label={task.priority} />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                    {task.assignedTo && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <User className="w-4 h-4" />
                            <span>Assigned to{' '}
                                <span className="text-white">{task.assignedTo.name}</span>
                            </span>
                        </div>
                    )}
                    {task.team && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Users className="w-4 h-4" />
                            <span>Team{' '}
                                <span className="text-white">{task.team.name}</span>
                            </span>
                        </div>
                    )}
                    {task.dueDate && (
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar className="w-4 h-4" />
                            <span>Due{' '}
                                <span className="text-white">
                                    {new Date(task.dueDate).toLocaleDateString()}
                                </span>
                            </span>
                        </div>
                    )}
                </div>
            </Card>

            {/* Comments */}
            <Card>
                <TaskComments taskId={taskId} />
            </Card>
        </div>
    );
}