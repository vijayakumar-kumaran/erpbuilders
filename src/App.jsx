import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import Layout from './components/layout/Layout';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';

// Main
import Dashboard from './pages/Dashboard/Dashboard';
import RequestedUserList from './pages/masters/RequestedUserList';
import TrackingPage from './pages/TrackingPage';
import OpeningStock from './pages/OpeningStock';

// Masters
import MaterialMaster from './pages/masters/MaterialMaster';
import SiteMaster from './pages/masters/SiteMaster';
import WorkStageMaster from './pages/masters/WorkStageMaster';
import RequestSource from './pages/masters/RequestSource';
import VendorMaster from './pages/masters/VendorMaster';
import VendorRateMaster from './pages/masters/VendorRateMaster';

// Operations
import MaterialRequest from './pages/MaterialRequest';
import ViewMaterialRequest from './pages/ViewMaterialRequest';
import MaterialRequestPO from './pages/MaterialOrderedThroughPO';
import MaterialAdditionalInputPO from './pages/MaterialAdditionalInputPO';
import MaterialOrderedThroughPOReview from './pages/MaterialOrderedThroughPOReview';
import PurchaseOrder from './pages/PurchaseOrder';

// Transactions
import MaterialIssueToSite from './pages/MaterialIssueToSite';
import MaterialReceiptEntry from './pages/MaterialReceiptEntry';
import MaterialAccountEntry from './pages/MatAccountEnrty';
import StockTransferEntry from './pages/StockTRFEntry';
import MaterialReturn from './pages/MaterialReturn';

// Reports
import ReportGenerator from './pages/Reports/StockReportByLocation';
import ConsolidatedReport from './pages/Reports/ConsildatedMaterialReport';
import ConsolidatedSiteReport from './pages/Reports/ConsolidatedSiteReport';
import MaterialIssueReport from './pages/Reports/MaterialIssueReport';
import MaterialIssueReportByDate from './pages/Reports/MaterialIssueReportByDate';
import PoStatusReport from './pages/Reports/POStatusReport';

// Menu Manager
import MenuManager from './pages/masters/MenuManager';
import MenuRoleUpdateManager from './pages/masters/MenuRoleManager';
import GlobalSettingsPage from './pages/RouteSetup/GloablSetup'
import Forbidden from './security/Forbidden'
import ProtectedRoute from './security/ProtectedRoute';

const App = () => {

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <BrowserRouter>
        <Routes>

          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/403" element={<Forbidden />} />

          {/* Reports */}
          <Route path="/reports/stocks" element={<ProtectedRoute><Layout><ReportGenerator /></Layout></ProtectedRoute>}/>
          <Route path="/reports/consolidated-material" element={<ProtectedRoute><Layout><ConsolidatedReport /></Layout></ProtectedRoute>}/>
          <Route path="/reports/consolidated-site" element={<ProtectedRoute><Layout><ConsolidatedSiteReport /></Layout></ProtectedRoute>}/>
          <Route path="/reports/material-issue-report" element={<ProtectedRoute><Layout><MaterialIssueReport/></Layout></ProtectedRoute>} />
          <Route path="/reports/material-issue-date-report" element={<ProtectedRoute><Layout><MaterialIssueReportByDate /></Layout></ProtectedRoute>} />
          <Route path="/reports/po-status" element={<ProtectedRoute><Layout><PoStatusReport /></Layout></ProtectedRoute>} />        
      

          <Route path="/settings" element={<ProtectedRoute><Layout><GlobalSettingsPage /></Layout></ProtectedRoute>} />

          {/* Protected Routes */}
          <Route path="/"element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute> }/>
          <Route path="/mat-request"element={<ProtectedRoute><Layout><MaterialRequest /></Layout></ProtectedRoute>}/>
          <Route path="/manage-mat-request" element={<ProtectedRoute><Layout><ViewMaterialRequest /></Layout></ProtectedRoute>}/>
          <Route path="/mat-request-po"element={<ProtectedRoute><Layout><MaterialRequestPO /></Layout></ProtectedRoute>}/>
          <Route path="/mat-issue-to-site" element={<ProtectedRoute><Layout><MaterialIssueToSite /></Layout></ProtectedRoute>}/>

          <Route path="/track-view" element={<ProtectedRoute><Layout><TrackingPage /></Layout></ProtectedRoute>}/>
          
          <Route path="/mat-request-po-review" element={ <ProtectedRoute><Layout><MaterialOrderedThroughPOReview /></Layout></ProtectedRoute>}/>
          <Route path="/mat-opening-stock" element={ <ProtectedRoute><Layout><OpeningStock /></Layout></ProtectedRoute>}/>
          
          {/* Masters */}
          <Route path="/req-users-list" element={<ProtectedRoute><Layout><RequestedUserList /></Layout></ProtectedRoute>} />
          <Route path="/req-source" element={<ProtectedRoute><Layout><RequestSource /></Layout></ProtectedRoute>} />
          <Route path="/mat-master" element={<ProtectedRoute><Layout><MaterialMaster /></Layout></ProtectedRoute>} />
          <Route path="/site-master" element={<ProtectedRoute><Layout><SiteMaster /></Layout></ProtectedRoute>} />
          <Route path="/work-stage-master" element={<ProtectedRoute><Layout><WorkStageMaster /></Layout></ProtectedRoute>} />
          <Route path='/vendor' element={<ProtectedRoute><Layout><VendorMaster /></Layout></ProtectedRoute>} />
          <Route path='/vendorrate' element={<ProtectedRoute><Layout><VendorRateMaster /></Layout></ProtectedRoute>} />
          <Route path='/mat-add-input' element={<ProtectedRoute><Layout><MaterialAdditionalInputPO /></Layout></ProtectedRoute>} />
          <Route path='/mat-purchase-order' element={<ProtectedRoute><Layout><PurchaseOrder /></Layout></ProtectedRoute>} />
          <Route path='/mat-receipt-entry' element={<ProtectedRoute><Layout><MaterialReceiptEntry /></Layout></ProtectedRoute>} />
          <Route path='/mat-account-entry' element={<ProtectedRoute><Layout><MaterialAccountEntry /></Layout></ProtectedRoute>} />
          <Route path='/stock-transfer' element={<ProtectedRoute><Layout><StockTransferEntry /></Layout></ProtectedRoute>} />
          <Route path='/material-return' element={<ProtectedRoute><Layout><MaterialReturn /></Layout></ProtectedRoute>} />
          <Route path="/menu-manager" element={ <ProtectedRoute><Layout><MenuManager /></Layout></ProtectedRoute>}/>
          <Route path="/menu-role-update-manager" element={ <ProtectedRoute><Layout><MenuRoleUpdateManager /></Layout></ProtectedRoute>}/>
        </Routes>
      </BrowserRouter>
    </LocalizationProvider>
  );
};

export default App;
