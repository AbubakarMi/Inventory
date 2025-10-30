import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table";
import { users } from "@/lib/data";
import { columns } from "@/components/users/columns";
import { UserModal } from "@/components/users/user-modal";

export default function UsersPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <div className="flex items-center justify-between">
                <h1 className="font-semibold text-lg md:text-2xl">Users</h1>
                <UserModal>
                    <Button>Add User</Button>
                </UserModal>
            </div>
            <DataTable columns={columns} data={users} />
        </div>
    )
}
