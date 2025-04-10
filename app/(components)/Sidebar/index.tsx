"use client";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsSideBarCollapsed } from "@/app/state";
import {
  Menu,
  Home,
  Settings,
  Users,
  FileText,
  BarChart,
  HelpCircle,
} from "lucide-react";
import React from "react";
import Link from "next/link";
import cheeseIcon from "../../../public/cheese-icon.png";
import Image from "next/image";

function Sidebar() {
  const dispatch = useAppDispatch();
  const isSidebarCollapsed = useAppSelector(
    (state) => state.global.isSidebarCollapsed
  );

  const toggleSidebar = () => {
    dispatch(setIsSideBarCollapsed(!isSidebarCollapsed));
  };

  const sidebarClassNames = `fixed flex flex-col ${
    isSidebarCollapsed ? "w-0 md:w-16" : "w-72 md:w-64"
  } bg-white transition-all duration-300 overflow-hidden h-full shadow-md z-40`;

  const navLinks = [
    { name: "Dashboard", icon: <Home size={20} />, href: "/dashboard" },
    { name: "Analytics", icon: <BarChart size={20} />, href: "/analytics" },
    { name: "Items", icon: <FileText size={20} />, href: "/view-items" },
    { name: "Users", icon: <Users size={20} />, href: "/users" },
    { name: "Settings", icon: <Settings size={20} />, href: "/settings" },
    { name: "Help", icon: <HelpCircle size={20} />, href: "/help" },
  ];

  return (
    <div className={sidebarClassNames}>
      <div
        className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${
          isSidebarCollapsed ? "px-5" : "px-8"
        }`}
      >
        <div className="flex ">
          <Image
            src={cheeseIcon}
            alt="cheeseLogo"
            width={50}
            height={50}
            className="rounded-full h-full object-cover"
          />
        </div>

        {!isSidebarCollapsed && (
          <h1 className="font-extrabold text-2xl">NachoSalez</h1>
        )}
        <button
          className="md:hidden px-3 py-3 bg-gray-100 rounded-full hover:bg-blue-100"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* LINKS */}
      <div className="flex flex-col grow mt-8 overflow-y-auto">
        <nav className="space-y-1 px-3">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center px-4 py-3 rounded-lg hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-all duration-200 ${
                isSidebarCollapsed ? "justify-center" : "justify-start"
              }`}
            >
              <div className="flex items-center">
                {link.icon}
                {!isSidebarCollapsed && (
                  <span className="ml-3 font-medium">{link.name}</span>
                )}
              </div>
            </Link>
          ))}
        </nav>
      </div>

      {/* FOOTER */}
      <div className="py-4">
        <p className="text-center text-xs text-gray-500">
          &copy; 2024 NachoCheez
        </p>
      </div>
    </div>
  );
}

export default Sidebar;
