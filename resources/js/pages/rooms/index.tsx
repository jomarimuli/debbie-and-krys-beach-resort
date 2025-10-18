// resources/js/pages/rooms/index.tsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, Hotel } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/datatable/datatable';
import CreateRoomModal from './create-room-modal';
import ShowRoomModal from './show-room-modal';
import EditRoomModal from './edit-room-modal';
import DeleteRoomModal from './delete-room-modal';

import { type RoomIndexProps, type RoomData, type DataTableColumn, type BreadcrumbItem } from '@/types';

export default function Index({ rooms, filterOptions, queryParams, ...props }: RoomIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [showModalOpen, setShowModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<RoomData | null>(null);

    const handleShow = (room: RoomData) => {
        setSelectedRoom(room);
        setShowModalOpen(true);
    };

    const handleEdit = (room: RoomData) => {
        setSelectedRoom(room);
        setEditModalOpen(true);
    };

    const handleDelete = (room: RoomData) => {
        setSelectedRoom(room);
        setDeleteModalOpen(true);
    };

    const canCreateRoom = props.auth.user?.permissions?.includes('room access') || props.auth.user?.permissions?.includes('global access');
    const canShowRoom = props.auth.user?.permissions?.includes('room access') || props.auth.user?.permissions?.includes('global access');
    const canEditRoom = props.auth.user?.permissions?.includes('room access') || props.auth.user?.permissions?.includes('global access');
    const canDeleteRoom = props.auth.user?.permissions?.includes('room access') || props.auth.user?.permissions?.includes('global access');

    const columns: DataTableColumn[] = [
        {
            key: 'name',
            label: 'Room Name',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '200px',
        },
        {
            key: 'size_display',
            label: 'Size',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '150px',
        },
        {
            key: 'max_pax',
            label: 'Max Pax',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '100px',
        },
        {
            key: 'day_tour_price_display',
            label: 'Day Tour Price',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
        {
            key: 'quantity',
            label: 'Quantity',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '100px',
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
            key: 'created_at',
            label: 'Created',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
    ];

    const transformedRooms = {
        ...rooms,
        data: rooms.data.map(room => ({
            ...room,
            size_display: (
                <Badge variant={room.size === 'big' ? 'default' : 'secondary'}>
                    {room.size_label}
                </Badge>
            ),
            day_tour_price_display: (
                <span className="font-medium">₱{room.formatted_day_tour_price}</span>
            ),
            status_display: (
                <Badge variant={room.is_active ? 'default' : 'secondary'}>
                    {room.status_label}
                </Badge>
            ),
        }))
    };

    const createButton = canCreateRoom ? (
        <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Room
        </Button>
    ) : null;

    const rawRoomsData = rooms.data.map(room => ({
        name: room.name,
        size: room.size_label,
        max_pax: room.max_pax,
        day_tour_price: room.formatted_day_tour_price,
        quantity: room.quantity,
        status: room.status_label,
        created_at: room.created_at,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Rooms',
            href: '/rooms',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rooms" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <DataTable
                        data={transformedRooms}
                        columns={columns}
                        filterOptions={filterOptions}
                        queryParams={queryParams}
                        title="Rooms Management"
                        createButton={createButton}
                        exportFileName="rooms"
                        rawData={rawRoomsData}
                    >
                        {(room: RoomData) => (
                            <div className="flex items-center justify-end gap-2">
                                {canShowRoom && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShow(room)}
                                        title="View room details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {canEditRoom && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(room)}
                                        title="Edit room"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canDeleteRoom && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(room)}
                                        title="Delete room"
                                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                    </DataTable>
                </div>
            </div>

            <CreateRoomModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {selectedRoom && (
                <>
                    <ShowRoomModal
                        open={showModalOpen}
                        onOpenChange={setShowModalOpen}
                        room={selectedRoom}
                    />
                    <EditRoomModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        room={selectedRoom}
                    />
                    <DeleteRoomModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        room={selectedRoom}
                    />
                </>
            )}
        </AppLayout>
    );
}
