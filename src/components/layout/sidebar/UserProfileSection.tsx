
import React from "react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { cn } from "@/lib/utils";

interface UserProfileSectionProps {
  userData: User | null;
  collapsed: boolean;
  handleLogout: () => void;
}

const UserProfileSection: React.FC<UserProfileSectionProps> = ({ userData, collapsed, handleLogout }) => {
  return (
    <div className={cn(
      "mt-auto border-t p-4",
      collapsed ? "flex justify-center" : "block"
    )}>
      {collapsed ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={userData?.avatar} />
                <AvatarFallback>{userData?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center" side="right">
            <div className="px-2 py-1.5 text-sm font-medium">{userData?.name}</div>
            <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
              <LogOut size={16} className="mr-2" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={userData?.avatar} />
              <AvatarFallback>{userData?.name?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{userData?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{userData?.role}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600"
            title="Sair"
          >
            <LogOut size={18} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default UserProfileSection;
