// resources/js/pages/entrance-fees/index.tsx
import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { Plus, Edit, Trash2, Eye, DollarSign } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/datatable/datatable';
import CreateEntranceFeeModal from './create-entrance-fee-modal';
import ShowEntranceFeeModal from './show-entrance-fee-modal';
import EditEntranceFeeModal from './edit-entrance-fee-modal';
import DeleteEntranceFeeModal from './delete-entrance-fee-modal';

import { type EntranceFeeIndexProps, type EntranceFeeData, type DataTableColumn, type BreadcrumbItem } from '@/types';

export default function Index({ entranceFees, filterOptions, queryParams, ...props }: EntranceFeeIndexProps) {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [showModalOpen, setShowModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedEntranceFee, setSelectedEntranceFee] = useState<EntranceFeeData | null>(null);

    const handleShow = (entranceFee: EntranceFeeData) => {
        setSelectedEntranceFee(entranceFee);
        setShowModalOpen(true);
    };

    const handleEdit = (entranceFee: EntranceFeeData) => {
        setSelectedEntranceFee(entranceFee);
        setEditModalOpen(true);
    };

    const handleDelete = (entranceFee: EntranceFeeData) => {
        setSelectedEntranceFee(entranceFee);
        setDeleteModalOpen(true);
    };

    const canCreateEntranceFee = props.auth.user?.permissions?.includes('entrance fee access') || props.auth.user?.permissions?.includes('global access');
    const canShowEntranceFee = props.auth.user?.permissions?.includes('entrance fee access') || props.auth.user?.permissions?.includes('global access');
    const canEditEntranceFee = props.auth.user?.permissions?.includes('entrance fee access') || props.auth.user?.permissions?.includes('global access');
    const canDeleteEntranceFee = props.auth.user?.permissions?.includes('entrance fee access') || props.auth.user?.permissions?.includes('global access');

    const columns: DataTableColumn[] = [
        {
            key: 'name',
            label: 'Fee Name',
            sortable: true,
            searchable: true,
            filterable: false,
            width: '250px',
        },
        {
            key: 'rental_type_display',
            label: 'Rental Type',
            sortable: true,
            searchable: false,
            filterable: true,
            width: '150px',
        },
        {
            key: 'price_display',
            label: 'Price',
            sortable: true,
            searchable: false,
            filterable: false,
            width: '120px',
        },
        {
            key: 'age_range',
            label: 'Age Range',
            sortable: false,
            searchable: false,
            filterable: false,
            width: '150px',
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

    const transformedEntranceFees = {
        ...entranceFees,
        data: entranceFees.data.map(fee => ({
            ...fee,
            rental_type_display: (
                <Badge variant="outline">
                    {fee.rental_type_label}
                </Badge>
            ),
            price_display: (
                <span className="font-medium">₱{fee.formatted_price}</span>
            ),
            status_display: (
                <Badge variant={fee.is_active ? 'default' : 'secondary'}>
                    {fee.status_label}
                </Badge>
            ),
        }))
    };

    const createButton = canCreateEntranceFee ? (
        <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Entrance Fee
        </Button>
    ) : null;

    const rawEntranceFeesData = entranceFees.data.map(fee => ({
        name: fee.name,
        rental_type: fee.rental_type_label,
        price: fee.formatted_price,
        age_range: fee.age_range,
        status: fee.status_label,
        created_at: fee.created_at,
    }));

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Entrance Fees',
            href: '/entrance-fees',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Entrance Fees" />

            <div className="py-6">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <DataTable
                        data={transformedEntranceFees}
                        columns={columns}
                        filterOptions={filterOptions}
                        queryParams={queryParams}
                        title="Entrance Fees Management"
                        createButton={createButton}
                        exportFileName="entrance-fees"
                        rawData={rawEntranceFeesData}
                    >
                        {(fee: EntranceFeeData) => (
                            <div className="flex items-center justify-end gap-2">
                                {canShowEntranceFee && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleShow(fee)}
                                        title="View entrance fee details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </Button>
                                )}
                                {canEditEntranceFee && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleEdit(fee)}
                                        title="Edit entrance fee"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </Button>
                                )}
                                {canDeleteEntranceFee && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleDelete(fee)}
                                        title="Delete entrance fee"
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

            <CreateEntranceFeeModal
                open={createModalOpen}
                onOpenChange={setCreateModalOpen}
            />

            {selectedEntranceFee && (
                <>
                    <ShowEntranceFeeModal
                        open={showModalOpen}
                        onOpenChange={setShowModalOpen}
                        entranceFee={selectedEntranceFee}
                    />
                    <EditEntranceFeeModal
                        open={editModalOpen}
                        onOpenChange={setEditModalOpen}
                        entranceFee={selectedEntranceFee}
                    />
                    <DeleteEntranceFeeModal
                        open={deleteModalOpen}
                        onOpenChange={setDeleteModalOpen}
                        entranceFee={selectedEntranceFee}
                    />
                </>
            )}
        </AppLayout>
    );
}
