'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PetsIcon from '@mui/icons-material/Pets';
import MedicalServicesIcon from '@mui/icons-material/MedicalServices';
import EventIcon from '@mui/icons-material/Event';
import HealingIcon from '@mui/icons-material/Healing';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import VaccinesIcon from '@mui/icons-material/Vaccines';
import HelpIcon from '@mui/icons-material/Help';
import TimelineIcon from '@mui/icons-material/Timeline';
import LogoutIcon from '@mui/icons-material/Logout';
import { useState } from 'react';
import { useAuth } from '@/lib/auth/AuthProvider';

const DRAWER_WIDTH = 260;

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: Array<'ADMIN' | 'OWNER'>;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
  { label: 'Owners', href: '/owners', icon: <PeopleIcon />, roles: ['ADMIN'] },
  { label: 'Pets', href: '/pets', icon: <PetsIcon /> },
  { label: 'Veterinarians', href: '/veterinarians', icon: <MedicalServicesIcon />, roles: ['ADMIN'] },
  { label: 'Appointments', href: '/appointments', icon: <EventIcon /> },
  { label: 'Visits', href: '/visits', icon: <HealingIcon /> },
  { label: 'Vaccinations', href: '/vaccinations', icon: <VaccinesIcon /> },
  { label: 'Vaccination Help', href: '/vaccination-help', icon: <HelpIcon /> },
  { label: 'Reminders', href: '/reminders', icon: <NotificationsActiveIcon /> },
  { label: 'Health Timeline', href: '/timeline', icon: <TimelineIcon /> },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV_ITEMS.filter(
    (item) => !item.roles || (user && item.roles.includes(user.role)),
  );

  const drawer = (
    <Box sx={{ pt: 2 }}>
      <Typography variant="h6" sx={{ px: 2, pb: 2, fontWeight: 700, color: 'primary.main' }}>
        PawMate
      </Typography>
      <List>
        {visibleNav.map((item) => (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={pathname.startsWith(item.href)}
            onClick={() => setMobileOpen(false)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
        <ListItemButton
          onClick={async () => {
            await signOut();
            router.push('/login');
          }}
        >
          <ListItemIcon>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Sign out" />
        </ListItemButton>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Veterinary Clinic Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email} · {user?.role}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
