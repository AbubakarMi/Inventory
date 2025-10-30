import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="flex flex-1 flex-col gap-4 md:gap-8">
            <h1 className="font-semibold text-lg md:text-2xl">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Coming Soon</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>This page is under construction. Check back later for settings options!</p>
                </CardContent>
            </Card>
        </div>
    );
}
