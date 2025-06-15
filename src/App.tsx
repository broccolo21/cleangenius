@@ .. @@
 import { Sidebar } from './components/Layout/Sidebar';
 import { Dashboard } from './components/Admin/Dashboard';
 import { EmployeeManagement } from './components/Admin/EmployeeManagement';
+import { ClientManagement } from './components/Admin/ClientManagement';
+import { ScheduleManagement } from './components/Admin/ScheduleManagement';
+import { LiveTracking } from './components/Admin/LiveTracking';
 import { MediaAnalysis } from './components/Admin/MediaAnalysis';
 import { MySchedule } from './components/Employee/MySchedule';
 import { CameraCapture } from './components/Employee/CameraCapture';
+import { Navigation } from './components/Employee/Navigation';
 import { ChatInterface } from './components/Chat/ChatInterface';
 import { ClientReports } from './components/Client/ClientReports';
@@ .. @@
         case 'employees':
           return <EmployeeManagement />;
+        case 'clients':
+          return <ClientManagement />;
+        case 'schedule':
+          return <ScheduleManagement />;
+        case 'tracking':
+          return <LiveTracking />;
         case 'media':
           return <MediaAnalysis />;
@@ .. @@
         case 'camera':
           return <CameraCapture />;
+        case 'navigation':
+          return <Navigation />;
         case 'chat':
           return <ChatInterface />;