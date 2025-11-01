"use client";

import { type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { useAlerts } from "@/hooks/use-alerts";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const { alerts } = useAlerts();
  const [user, setUser] = useState<User | null>();
  const [buildingsCount, setBuildingsCount] = useState<number>();

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const getBuildingsForUser = async (userId: string) => {
      const { data: buildings, error } = await supabase
        .from("buildings")
        .select("id")
        .eq("user_id", userId);

      if (buildings) {
        setBuildingsCount(buildings?.length || 0);
      }
    };

    if (user?.id) {
      getBuildingsForUser(user.id);
    }
  }, [user]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <Link href={item.url}>
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>

                  {alerts.length > 0 && item.title === "Zgłoszenia" && (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground px-1.5"
                    >
                      {alerts.length}
                    </Badge>
                  )}

                  {item.title === "Nieruchomości" && (
                    <Badge
                      variant="outline"
                      className="text-muted-foreground px-1.5"
                    >
                      {buildingsCount}
                    </Badge>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
