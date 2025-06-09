import React from 'react';
import { ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export interface ListItemLinkProps {
  icon?: React.ReactNode;
  primary?: string;
  to: string;
  onClick?: () => void;
  sx?: object;
  children?: React.ReactNode; // ✅ Add this line
}

export default function ListItemLink({
  icon,
  primary,
  to,
  onClick,
  sx,
  children, // ✅ receive children here
}: ListItemLinkProps) {
  return (
    <li>
      <ListItemButton component={RouterLink} to={to} onClick={onClick} sx={sx}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        {primary && <ListItemText primary={primary} />}
        {children} {/* ✅ Render children here */}
      </ListItemButton>
    </li>
  );
}

