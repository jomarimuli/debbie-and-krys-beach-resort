import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit, Trash2, Shield, ShieldCheck, Eye, Lock, LockOpen } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/datatable/datatable';
import CreateUserModal from './create-user-modal';
import ShowUserModal from './show-user-modal';
import EditUserModal from './edit-user-modal';
import LockUserModal from './lock-user-modal';
import DeleteUserModal from './delete-user-modal';

import { type UserIndexProps, type UserData, type DataTableColumn, type BreadcrumbItem } from '@/types';

export default function Index({ users, availableRoles, filterOptions, queryParams, ...props }: UserIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [showModalOpen, setShowModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [lockModalOpen, setLockModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

    const originalUsersMap = new Map(users.data.map(user => [user.id, user]));

    const handleShow = (user: UserData) => {
        setSelectedUser(originalUsersMap.get(user.id) || user);
        setShowModalOpen(true);
    };

    const handleEdit = (user: UserData) => {
        setSelectedUser(originalUsersMap.get(user.id) || user);
        setEditModalOpen(true);
    };

    const handleLock = (user: UserData) => {
        setSelectedUser(originalUsersMap.get(user.id) || user);
        setLockModalOpen(true);
    };

    const handleDelete = (user: UserData) => {
        setSelectedUser(originalUsersMap.get(user.id) || user);
        setDeleteModalOpen(true);
    };

    const canCreateUser = props.auth.user?.permissions?.includes('user create') || props.auth.user?.permissions?.includes('global access');
    const canShowUser = props.auth.user?.permissions?.includes('user show') || props.auth.user?.permissions?.includes('global access');
    const canEditUser = props.auth.user?.permissions?.includes('user edit') || props.auth.user?.permissions?.includes('global access');
    const canLockUser = props.auth.user?.permissions?.includes('user edit') || props.auth.user?.permissions?.includes('global access');
    const canDeleteUser = props.auth.user?.permissions?.includes('user delete') || props.auth.user?.permissions?.includes('global access');

    // Define table columns
    const columns: DataTableColumn[] = [
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '200px',
        },
        {
            key: 'email',
            label: 'Email',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '250px',
        },
        {
            key: 'phone',
            label: 'Phone',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '150px',
        },
        {
            key: 'address',
            label: 'Address',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '200px',
        },
        {
            key: 'status_display',
            label: 'Status',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '120px',
        },
        {
            key: 'email_verified_display',
            label: 'Email Verified',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '140px',
        },
        {
            key: 'roles_display',
            label: 'Roles',
            sortable: false,
            searchable: false,
            filterable: true,
            className: 'max-w-md',
        },
        {
            key: 'created_at',
            label: 'Created',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
    ];

    // Transform data for display
    const transformedUsers = {
        ...users,
        data: users.data.map(user => ({
            ...user,
            phone: user.phone || <span className="text-gray-400 text-sm">Not provided</span>,
            address: user.address || <span className="text-gray-400 text-sm">Not provided</span>,
            status_display: (
                <Badge
                    variant={user.status === 'active' ? 'default' : 'secondary'}
                >
                    {user.status_label}
                </Badge>
            ),
            email_verified_display: (
                <div className="flex items-center gap-2">
                    {user.email_verified_at ? (
                        <>
                            <ShieldCheck className="w-4 h-4 text-green-600" />
                            <span className="text-green-600">Verified</span>
                        </>
                    ) : (
                        <>
                            <Shield className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Unverified</span>
                        </>
                    )}
                </div>
            ),
            roles_display: (
                <div className="flex flex-wrap gap-1 max-w-md">
                    {user.roles.length > 0 ? (
                        <>
                            {user.roles.slice(0, 2).map((role) => (
                                <Badge
                                    key={role}
                                    variant={role === 'admin' ? 'destructive' : 'secondary'}
                                    className="text-xs"
                                >
                                    {role.charAt(0).toUpperCase() + role.slice(1)}
                                </Badge>
                            ))}
                            {user.roles.length > 2 && (
                                <Badge variant="outline" className="text-xs">
                                    +{user.roles.length - 2} more
                                </Badge>
                            )}
                        </>
                    ) : (
                        <span className="text-gray-400 text-sm">No roles</span>
                    )}
                </div>
            ),
        }))
    } as typeof users;

    const createButton = canCreateUser ? (
        <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create User
        </Button>
    ) : null;

    const rawUsersData = users.data.map(user => ({
        name: user.name,
        email: user.email,
        phone: user.phone || 'N/A',
        address: user.address || 'N/A',
        status: user.status_label,
        email_verified: user.email_verified,
        roles: user.roles_text,
        created_at: user.created_at,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Users',
            href: '/users',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <DataTable
                        data={transformedUsers}
                        columns={columns}
                        filterOptions={filterOptions}
                        queryParams={queryParams}
                        title="Users Management"
                        createButton={createButton}
                        exportFileName="users"
                        rawData={rawUsersData}
                    >
                        {(user: UserData) => (
                            <div className="flex items-center justify-end gap-2">
                                {canShowUser && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShow(user)}
                                        title="View user details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {canEditUser && user.can_edit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(user)}
                                        title="Edit user"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canLockUser && user.can_edit && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleLock(user)}
                                        title={user.is_locked ? 'Unlock user' : 'Lock user'}
                                        className={user.is_locked ? 'text-green-600 hover:text-green-700 hover:border-green-300' : 'text-orange-600 hover:text-orange-700 hover:border-orange-300'}
                                    >
                                        {user.is_locked ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                    </Button>
                                )}
                                {canDeleteUser && user.can_delete && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(user)}
                                        title="Delete user"
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                                {user.is_admin && (
                                    <Badge variant="secondary" className="text-xs">
                                        Protected
                                    </Badge>
                                )}
                            </div>
                        )}
                    </DataTable>
                </div>
            </div>

            <CreateUserModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
                availableRoles={availableRoles}
            />

            {selectedUser && (
                <>
                    <ShowUserModal
                        open={showModalOpen}
                        onOpenChange={setShowModalOpen}
                        user={selectedUser}

                    />
                    <EditUserModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        user={selectedUser}
                        availableRoles={availableRoles}
                    />
                    <LockUserModal
                        open={lockModalOpen}
                        onOpenChange={setLockModalOpen}
                        user={selectedUser}
                    />
                    <DeleteUserModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        user={selectedUser}
                    />
                </>
            )}
        </AppLayout>
    );
}
