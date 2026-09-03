'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser, getUserStorageKey } from './UserContext';

export type SupportedLanguage = 'English' | 'Tamil' | 'Hindi';

export interface PreferencesState {
  whatsappAlerts: boolean;
  emailAlerts: boolean;
  smsAlerts: boolean;
  weeklyDigest: boolean;
  language: SupportedLanguage;
  timezone: string;
  autoLogout: string;
}

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  whatsappAlerts: boolean;
  setWhatsappAlerts: (enabled: boolean) => void;
  preferences: PreferencesState;
  updatePreferences: (updates: Partial<PreferencesState>) => void;
  t: (key: string) => string;
}

const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    // Navigation
    'nav.mainMenu': 'Main Menu',
    'nav.dashboard': 'Dashboard',
    'nav.bookAppointment': 'Book Appointment',
    'nav.myAppointments': 'My Appointments',
    'nav.myApplications': 'My Applications',
    'nav.documentUpload': 'Document Upload',
    'nav.paymentsReceipts': 'Payments & Receipts',
    'nav.accountPreferences': 'Account & Preferences',
    'nav.profile': 'Profile',
    'nav.settings': 'Settings',
    'nav.logOut': 'Log out',
    'nav.viewProfile': 'View profile',
    'nav.bookNewService': '+ Book New Service',

    // Titles & Subtitles
    'header.goodDay': 'Good day',
    'header.dashboardSub': "Here's a real-time overview of your current applications and scheduled appointments.",
    'header.myAppointmentsTitle': 'My Appointments',
    'header.myAppointmentsSub': 'View, reschedule, or cancel your scheduled appointments.',
    'header.myApplicationsTitle': 'My Applications',
    'header.myApplicationsSub': 'Track and manage your submitted service requests.',
    'header.documentUploadTitle': 'Document Upload & Management',
    'header.documentUploadSub': 'Upload essential certificates, government IDs, and legal deeds for official verification.',
    'header.paymentsTitle': 'Payments & Receipts',
    'header.paymentsSub': 'Manage your financial transactions and documentation.',
    'header.bookAppointmentTitle': 'Book Appointment',
    'header.bookAppointmentSub': 'Follow the steps below to schedule an appointment for your required service.',
    'header.profileTitle': 'My Profile & Identity',
    'header.profileSub': 'Manage your official personal information, government verification status, and contact credentials.',
    'header.settingsTitle': 'System & Security Settings',
    'header.settingsSub': 'Configure security preferences, notifications, and portal settings.',
    'header.notificationsTitle': 'Notification Center',
    'header.notificationsSub': 'All your notifications and alerts in real-time.',
    'header.customerPortal': 'Customer Portal',

    // Common Actions & Buttons
    'btn.next': 'Next',
    'btn.back': 'Back',
    'btn.skipNext': 'Skip / Next',
    'btn.search': 'Search...',
    'btn.all': 'All',
    'btn.upcoming': 'Upcoming',
    'btn.completed': 'Completed',
    'btn.cancelled': 'Cancelled',
    'btn.rescheduled': 'Rescheduled',
    'btn.inProgress': 'In Progress',
    'btn.approved': 'Approved',
    'btn.pending': 'Pending',
    'btn.savePreferences': 'Save Preferences',
    'btn.shareWhatsApp': 'Share Details to Admin on WhatsApp',

    // Settings Page
    'settings.securityTitle': 'Security & Password',
    'settings.securitySub': 'Update your login password to keep your account secure.',
    'settings.currentPassword': 'Current Password',
    'settings.newPassword': 'New Password',
    'settings.confirmNewPassword': 'Confirm New Password',
    'settings.updatePasswordBtn': 'Update Password',
    'settings.updatingPasswordBtn': 'Updating Password...',
    'settings.notificationHeader': 'Notification Alerts & Portal Preferences',
    'settings.notificationSub': 'Control which notification channels stay active and set language defaults.',
    'settings.emailAlerts': 'Email Notifications',
    'settings.emailAlertsSub': 'Receive application receipts & status emails.',
    'settings.smsAlerts': 'SMS Reminders',
    'settings.smsAlertsSub': 'Receive appointment reminders via SMS.',
    'settings.whatsappAlerts': 'WhatsApp Alerts',
    'settings.whatsappAlertsSub': 'Receive direct status updates on WhatsApp.',
    'settings.weeklyDigest': 'Weekly Activity Summary',
    'settings.weeklyDigestSub': 'Receive a weekly digest report of active requests.',
    'settings.languageLabel': 'Preferred Portal Language',
    'settings.timezoneLabel': 'Timezone',
    'settings.autoLogoutLabel': 'Auto Logout Inactivity',
    'settings.savedSuccess': 'Settings updated successfully!',

    // Book Appointment Wizard
    'book.step1Label': 'Service',
    'book.step2Label': 'Details',
    'book.step3Label': 'Documents (Optional)',
    'book.step4Label': 'Review',
    'book.step5Label': 'Confirmation',
    'book.step1Header': 'Step 1: Select Service',
    'book.step1Sub': 'Choose the primary service you require an appointment for.',
    'book.searchServicePlaceholder': 'Search service by name...',
    'book.step2Header': 'Step 2: Appointment Details & Schedule',
    'book.step2Sub': 'Select your preferred mode of consultation, date, and available time slot.',
    'book.step3Header': 'Step 3: Document Upload (Optional)',
    'book.step3Sub': 'Attach relevant ID proofs or application receipts to speed up processing.',
    'book.step4Header': 'Step 4: Review Booking Summary',
    'book.step4Sub': 'Verify all appointment details before final submission.',
    'book.step5Header': 'Step 5: Confirmation',
    'book.aptBookedTitle': 'Appointment Scheduled Successfully!',
    'book.bookAnother': 'Book Another',
    'book.viewMyApts': 'View My Appointments',

    // Appointments Page
    'apts.statTotal': 'Total Appointments',
    'apts.statTotalSub': 'Booked sessions',
    'apts.statConfirmed': 'Confirmed Slots',
    'apts.statConfirmedSub': 'Active bookings',
    'apts.statCompleted': 'Completed Sessions',
    'apts.statCompletedSub': 'Concluded',
    'apts.statRescheduled': 'Rescheduled / Cancelled',
    'apts.statRescheduledSub': 'Modified slots',
    'apts.searchPlaceholder': 'Search appointments...',
    'apts.bookAptBtn': '+ Book Appointment',

    // Documents Page
    'docs.statTotal': 'Total Documents',
    'docs.statTotalSub': 'Encrypted in vault',
    'docs.statApproved': 'Approved / Verified',
    'docs.statApprovedSub': 'Verified by officer',
    'docs.statReview': 'Under Review',
    'docs.statReviewSub': 'Pending verification',
    'docs.statLinked': 'Linked Applications',
    'docs.statLinkedSub': 'Active folders',
    'docs.uploadHeader': 'Upload Official Documents',
    'docs.uploadSub': 'Files are AES-256-GCM encrypted and stored securely. Supported: PDF, PNG, JPG, WEBP (max 10 MB).',
    'docs.appLabel': 'Application',
    'docs.docTypeLabel': 'Document Type',
    'docs.browseUploadBtn': '+ Browse & Upload',
    'docs.yourDocsHeader': 'Your Documents',

    // Applications Page
    'apps.statTotal': 'Total Requests',
    'apps.statTotalSub': 'Submitted requests',
    'apps.statProgress': 'In Progress',
    'apps.statProgressSub': 'Under processing',
    'apps.statApproved': 'Approved',
    'apps.statApprovedSub': 'Completed & issued',
    'apps.statPending': 'Pending Action',
    'apps.statPendingSub': 'Requires attention',
    'apps.searchPlaceholder': 'Search applications by ID or service...',
    'apps.newAppBtn': '+ New Application',

    // Payments Page
    'pay.statTotal': 'Total Expenditure',
    'pay.statTotalSub': 'Lifetime billing',
    'pay.statSuccess': 'Successful Payments',
    'pay.statSuccessSub': 'Verified receipts',
    'pay.statPending': 'Pending Invoices',
    'pay.statPendingSub': 'Due payments',
    'pay.statRefunds': 'Refunds / Adjustments',
    'pay.statRefundsSub': 'Processed credits',
    'pay.searchPlaceholder': 'Search receipts by Transaction Ref or ID...',
    'pay.exportPdfBtn': 'Export PDF Statement',
  },
  Tamil: {
    // Navigation
    'nav.mainMenu': 'முதன்மை மெனு',
    'nav.dashboard': 'முகப்பு',
    'nav.bookAppointment': 'சந்திப்பு பதிவு',
    'nav.myAppointments': 'எனது சந்திப்புகள்',
    'nav.myApplications': 'எனது விண்ணப்பங்கள்',
    'nav.documentUpload': 'ஆவண பதிவேற்றம்',
    'nav.paymentsReceipts': 'கட்டணங்கள் & ரசீதுகள்',
    'nav.accountPreferences': 'கணக்கு & விருப்பத்தேர்வுகள்',
    'nav.profile': 'சுயவிவரம்',
    'nav.settings': 'அமைப்புகள்',
    'nav.logOut': 'வெளியேறு',
    'nav.viewProfile': 'சுயவிவரத்தைப் பார்க்கவும்',
    'nav.bookNewService': '+ புதிய சேவை பதிவு',

    // Titles & Subtitles
    'header.goodDay': 'வணக்கம்',
    'header.dashboardSub': 'உங்கள் நடப்பு விண்ணப்பங்கள் மற்றும் திட்டமிடப்பட்ட சந்திப்புகளின் நேரலை மேலோட்டம்.',
    'header.myAppointmentsTitle': 'எனது சந்திப்புகள்',
    'header.myAppointmentsSub': 'உங்கள் திட்டமிடப்பட்ட சந்திப்புகளைப் பார்க்கவும், மாற்றவும் அல்லது ரத்து செய்யவும்.',
    'header.myApplicationsTitle': 'எனது விண்ணப்பங்கள்',
    'header.myApplicationsSub': 'உங்கள் சமர்ப்பிக்கப்பட்ட சேவை கோரிக்கைகளைக் கண்காணித்து நிர்வகிக்கவும்.',
    'header.documentUploadTitle': 'ஆவண பதிவேற்றம் & மேலாண்மை',
    'header.documentUploadSub': 'அதிகாரப்பூர்வ சரிபார்ப்பிற்கு அத்தியாவசிய சான்றிதழ்கள் மற்றும் அடையாள ஆவணங்களைப் பதிவேற்றவும்.',
    'header.paymentsTitle': 'கட்டணங்கள் & ரசீதுகள்',
    'header.paymentsSub': 'உங்கள் நிதி பரிவர்த்தனைகள் மற்றும் ஆவணங்களை நிர்வகிக்கவும்.',
    'header.bookAppointmentTitle': 'சந்திப்பு பதிவு',
    'header.bookAppointmentSub': 'தேவையான சேவைக்கு சந்திப்பைத் திட்டமிட கீழே உள்ள படிகளைப் பின்தொடரவும்.',
    'header.profileTitle': 'எனது சுயவிவரம் & அடையாளம்',
    'header.profileSub': 'உங்கள் அதிகாரப்பூர்வ தனிப்பட்ட விவரங்கள் மற்றும் தொடர்புத் தகவல்களை நிர்வகிக்கவும்.',
    'header.settingsTitle': 'அமைப்புகள் & பாதுகாப்பு',
    'header.settingsSub': 'பாதுகாப்பு விருப்பத்தேர்வுகள், அறிவிப்புகள் மற்றும் போர்ட்டல் அமைப்புகளை உள்ளமைக்கவும்.',
    'header.notificationsTitle': 'அறிவிப்பு மையம்',
    'header.notificationsSub': 'உங்கள் அனைத்து அறிவிப்புகளும் நேரலையில்.',
    'header.customerPortal': 'வாடிக்கையாளர் போர்ட்டல்',

    // Common Actions & Buttons
    'btn.next': 'அடுத்து',
    'btn.back': 'பின்புறம்',
    'btn.skipNext': 'தவிர்க்க / அடுத்து',
    'btn.search': 'தேடு...',
    'btn.all': 'அனைத்தும்',
    'btn.upcoming': 'வரவிருப்பவை',
    'btn.completed': 'நிறைவடைந்தவை',
    'btn.cancelled': 'ரத்து செய்யப்பட்டவை',
    'btn.rescheduled': 'தேதி மாற்றப்பட்டவை',
    'btn.inProgress': 'செயல்பாட்டில் உள்ளது',
    'btn.approved': 'அங்கீகரிக்கப்பட்டது',
    'btn.pending': 'நிலுவையில் உள்ளது',
    'btn.savePreferences': 'விருப்பங்களைச் சேமிக்கவும்',
    'btn.shareWhatsApp': 'வாட்ஸ்அப்பில் விவரங்களைப் பகிரவும்',

    // Settings Page
    'settings.securityTitle': 'பாதுகாப்பு & கடவுச்சொல்',
    'settings.securitySub': 'உங்கள் கணக்கைப் பாதுகாப்பாக வைத்திருக்க கடவுச்சொல்லை புதுப்பிக்கவும்.',
    'settings.currentPassword': 'தற்போதைய கடவுச்சொல்',
    'settings.newPassword': 'புதிய கடவுச்சொல்',
    'settings.confirmNewPassword': 'புதிய கடவுச்சொல்லை உறுதிப்படுத்தவும்',
    'settings.updatePasswordBtn': 'கடவுச்சொல்லை புதுப்பிக்கவும்',
    'settings.updatingPasswordBtn': 'புதுப்பிக்கப்படுகிறது...',
    'settings.notificationHeader': 'அறிவிப்பு எச்சரிக்கைகள் & போர்ட்டல் விருப்பத்தேர்வுகள்',
    'settings.notificationSub': 'எந்த அறிவிப்பு சேனல்கள் செயலில் உள்ளன என்பதைக் கட்டுப்படுத்தி மொழியை அமைக்கவும்.',
    'settings.emailAlerts': 'மின்னஞ்சல் அறிவிப்புகள்',
    'settings.emailAlertsSub': 'விண்ணப்ப ரசீதுகள் & நிலை மின்னஞ்சல்களைப் பெறுங்கள்.',
    'settings.smsAlerts': 'எஸ்எம்எஸ் நினைவூட்டல்கள்',
    'settings.smsAlertsSub': 'சந்திப்பு நினைவூட்டல்களை எஸ்எம்எஸ் மூலம் பெறுங்கள்.',
    'settings.whatsappAlerts': 'வாட்ஸ்அப் எச்சரிக்கைகள்',
    'settings.whatsappAlertsSub': 'வாட்ஸ்அப்பில் நேரடி நிலை புதுப்பிப்புகளைப் பெறுங்கள்.',
    'settings.weeklyDigest': 'வாராந்திர செயல்பாட்டு சுருக்கம்',
    'settings.weeklyDigestSub': 'செயலில் உள்ள கோரிக்கைகளின் வாராந்திர அறிக்கையைப் பெறுங்கள்.',
    'settings.languageLabel': 'விருப்பமான போர்ட்டல் மொழி',
    'settings.timezoneLabel': 'நேர மண்டலம்',
    'settings.autoLogoutLabel': 'தானியங்கி வெளியேற்றம்',
    'settings.savedSuccess': 'அமைப்புகள் வெற்றிகரமாக புதுப்பிக்கப்பட்டன!',

    // Book Appointment Wizard
    'book.step1Label': 'சேவை',
    'book.step2Label': 'விவரங்கள்',
    'book.step3Label': 'ஆவணங்கள் (விருப்பமானது)',
    'book.step4Label': 'சரிபார்ப்பு',
    'book.step5Label': 'உறுதிப்படுத்தல்',
    'book.step1Header': 'படி 1: சேவையைத் தேர்ந்தெடுக்கவும்',
    'book.step1Sub': 'உங்களுக்கு சந்திப்பு தேவைப்படும் முதன்மை சேவையைத் தேர்ந்தெடுக்கவும்.',
    'book.searchServicePlaceholder': 'சேவை பெயரைத் தேடவும்...',
    'book.step2Header': 'படி 2: சந்திப்பு விவரங்கள் & நேரம்',
    'book.step2Sub': 'உங்கள் விருப்பமான ஆலோசனை முறை, தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.',
    'book.step3Header': 'படி 3: ஆவண பதிவேற்றம் (விருப்பமானது)',
    'book.step3Sub': 'செயலாக்கத்தை விரைவுபடுத்த தொடர்புடைய அடையாள சான்றுகளை இணைக்கவும்.',
    'book.step4Header': 'படி 4: முன்பதிவு சுருக்கத்தை சரிபார்க்கவும்',
    'book.step4Sub': 'இறுதி சமர்ப்பிப்பிற்கு முன் அனைத்து விவரங்களையும் சரிபார்க்கவும்.',
    'book.step5Header': 'படி 5: உறுதிப்படுத்தல்',
    'book.aptBookedTitle': 'சந்திப்பு வெற்றிகரமாக திட்டமிடப்பட்டது!',
    'book.bookAnother': 'மற்றொரு சந்திப்பு பதிவு',
    'book.viewMyApts': 'எனது சந்திப்புகளைப் பார்க்கவும்',

    // Appointments Page
    'apts.statTotal': 'மொத்த சந்திப்புகள்',
    'apts.statTotalSub': 'பதிவு செய்யப்பட்டவை',
    'apts.statConfirmed': 'உறுதி செய்யப்பட்டவை',
    'apts.statConfirmedSub': 'செயலில் உள்ள முன்பதிவுகள்',
    'apts.statCompleted': 'நிறைவடைந்த அமர்வுகள்',
    'apts.statCompletedSub': 'முடிவடைந்தவை',
    'apts.statRescheduled': 'தேதி மாற்றப்பட்டது / ரத்து செய்யப்பட்டது',
    'apts.statRescheduledSub': 'மாற்றப்பட்ட இடங்கள்',
    'apts.searchPlaceholder': 'சந்திப்புகளைத் தேடுங்கள்...',
    'apts.bookAptBtn': '+ சந்திப்பு பதிவு',

    // Documents Page
    'docs.statTotal': 'மொத்த ஆவணங்கள்',
    'docs.statTotalSub': 'பாதுகாப்பாக சேமிக்கப்பட்டது',
    'docs.statApproved': 'அங்கீகரிக்கப்பட்டது / சரிபார்க்கப்பட்டது',
    'docs.statApprovedSub': 'அதிகாரியால் சரிபார்க்கப்பட்டது',
    'docs.statReview': 'பரிசீலனையில் உள்ளது',
    'docs.statReviewSub': 'சரிபார்ப்பு நிலுவையில் உள்ளது',
    'docs.statLinked': 'இணைக்கப்பட்ட விண்ணப்பங்கள்',
    'docs.statLinkedSub': 'செயலில் உள்ள கோப்புறைகள்',
    'docs.uploadHeader': 'அதிகாரப்பூர்வ ஆவணங்களை பதிவேற்றவும்',
    'docs.uploadSub': 'கோப்புகள் AES-256-GCM குறியாக்கம் செய்யப்பட்டு பாதுகாப்பாக சேமிக்கப்படும்.',
    'docs.appLabel': 'விண்ணப்பம்',
    'docs.docTypeLabel': 'ஆவண வகை',
    'docs.browseUploadBtn': '+ உலாவும் & பதிவேற்றவும்',
    'docs.yourDocsHeader': 'உங்கள் ஆவணங்கள்',

    // Applications Page
    'apps.statTotal': 'மொத்த கோரிக்கைகள்',
    'apps.statTotalSub': 'சமர்ப்பிக்கப்பட்டவை',
    'apps.statProgress': 'செயல்பாட்டில் உள்ளது',
    'apps.statProgressSub': 'பரிசீலனையில் உள்ளது',
    'apps.statApproved': 'அங்கீகரிக்கப்பட்டது',
    'apps.statApprovedSub': 'நிறைவடைந்து வழங்கப்பட்டது',
    'apps.statPending': 'நிலுவையில் உள்ளது',
    'apps.statPendingSub': 'கவனம் தேவைப்படுகிறது',
    'apps.searchPlaceholder': 'விண்ணப்ப ஐடி அல்லது சேவையை தேடவும்...',
    'apps.newAppBtn': '+ புதிய விண்ணப்பம்',

    // Payments Page
    'pay.statTotal': 'மொத்த செலவு',
    'pay.statTotalSub': 'ஆயுட்கால பில்லிங்',
    'pay.statSuccess': 'வெற்றிகரமான கட்டணங்கள்',
    'pay.statSuccessSub': 'சரிபார்க்கப்பட்ட ரசீதுகள்',
    'pay.statPending': 'நிலுவையில் உள்ள இன்வாய்ஸ்கள்',
    'pay.statPendingSub': 'செலுத்த வேண்டியவை',
    'pay.statRefunds': 'திரும்பப் பெறப்பட்டவை',
    'pay.statRefundsSub': 'செயலாக்கப்பட்ட தொகைகள்',
    'pay.searchPlaceholder': 'ரசீதுகளைத் தேடுங்கள்...',
    'pay.exportPdfBtn': 'PDF அறிக்கை பதிவிறக்கு',
  },
  Hindi: {
    // Navigation
    'nav.mainMenu': 'मुख्य मेनू',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.bookAppointment': 'अपॉइंटमेंट बुक करें',
    'nav.myAppointments': 'मेरे अपॉइंटमेंट्स',
    'nav.myApplications': 'मेरे आवेदन',
    'nav.documentUpload': 'दस्तावेज़ अपलोड',
    'nav.paymentsReceipts': 'भुगतान और रसीदें',
    'nav.accountPreferences': 'खाता और प्राथमिकताएं',
    'nav.profile': 'प्रोफ़ाइल',
    'nav.settings': 'सेटिंग्स',
    'nav.logOut': 'लॉग आउट',
    'nav.viewProfile': 'प्रोफ़ाइल देखें',
    'nav.bookNewService': '+ नई सेवा बुक करें',

    // Titles & Subtitles
    'header.goodDay': 'शुभ दिन',
    'header.dashboardSub': 'आपके वर्तमान आवेदनों और निर्धारित अपॉइंटमेंट्स का रीयल-टाइम अवलोकन।',
    'header.myAppointmentsTitle': 'मेरे अपॉइंटमेंट्स',
    'header.myAppointmentsSub': 'अपने निर्धारित अपॉइंटमेंट्स देखें, पुनर्निर्धारित करें या रद्द करें।',
    'header.myApplicationsTitle': 'मेरे आवेदन',
    'header.myApplicationsSub': 'अपने सबमिट किए गए सेवा अनुरोधों को ट्रैक और प्रबंधित करें।',
    'header.documentUploadTitle': 'दस्तावेज़ अपलोड और प्रबंधन',
    'header.documentUploadSub': 'आधिकारिक सत्यापन के लिए आवश्यक प्रमाण पत्र और पहचान पत्र अपलोड करें।',
    'header.paymentsTitle': 'भुगतान और रसीदें',
    'header.paymentsSub': 'अपने वित्तीय लेनदेन और दस्तावेज़ों का प्रबंधन करें।',
    'header.bookAppointmentTitle': 'अपॉइंटमेंट बुक करें',
    'header.bookAppointmentSub': 'अपनी आवश्यक सेवा के लिए अपॉइंटमेंट बुक करने हेतु नीचे दिए गए चरणों का पालन करें।',
    'header.profileTitle': 'मेरी प्रोफ़ाइल और पहचान',
    'header.profileSub': 'अपनी आधिकारिक व्यक्तिगत जानकारी और संपर्क विवरण प्रबंधित करें।',
    'header.settingsTitle': 'सिस्टम और सुरक्षा सेटिंग्स',
    'header.settingsSub': 'सुरक्षा प्राथमिकताओं, सूचनाओं और पोर्टल सेटिंग्स को कॉन्फ़िगर करें।',
    'header.notificationsTitle': 'सूचना केंद्र',
    'header.notificationsSub': 'आपकी सभी सूचनाएं और अलर्ट रीयल-टाइम में।',
    'header.customerPortal': 'ग्राहक पोर्टल',

    // Common Actions & Buttons
    'btn.next': 'आगे',
    'btn.back': 'पीछे',
    'btn.skipNext': 'छोड़ें / आगे',
    'btn.search': 'खोजें...',
    'btn.all': 'सभी',
    'btn.upcoming': 'आगामी',
    'btn.completed': 'पूरा हुआ',
    'btn.cancelled': 'रद्द किया गया',
    'btn.rescheduled': 'पुनर्निर्धारित',
    'btn.inProgress': 'प्रगति पर है',
    'btn.approved': 'स्वीकृत',
    'btn.pending': 'लंबित',
    'btn.savePreferences': 'प्राथमिकताएं सहेजें',
    'btn.shareWhatsApp': 'व्हाट्सएप पर विवरण साझा करें',

    // Settings Page
    'settings.securityTitle': 'सुरक्षा और पासवर्ड',
    'settings.securitySub': 'अपने खाते को सुरक्षित रखने के लिए अपना लॉगिन पासवर्ड अपडेट करें।',
    'settings.currentPassword': 'वर्तमान पासवर्ड',
    'settings.newPassword': 'नया पासवर्ड',
    'settings.confirmNewPassword': 'नए पासवर्ड की पुष्टि करें',
    'settings.updatePasswordBtn': 'पासवर्ड अपडेट करें',
    'settings.updatingPasswordBtn': 'पासवर्ड अपडेट हो रहा है...',
    'settings.notificationHeader': 'सूचना अलर्ट और पोर्टल प्राथमिकताएं',
    'settings.notificationSub': 'नियंत्रित करें कि कौन से अधिसूचना चैनल सक्रिय रहें और भाषा सेट करें।',
    'settings.emailAlerts': 'ईमेल सूचनाएं',
    'settings.emailAlertsSub': 'आवेदन रसीदें और स्थिति ईमेल प्राप्त करें।',
    'settings.smsAlerts': 'एसएमएस अनुस्मारक',
    'settings.smsAlertsSub': 'एसएमएस के माध्यम से अपॉइंटमेंट अनुस्मारक प्राप्त करें।',
    'settings.whatsappAlerts': 'व्हाट्सएप अलर्ट',
    'settings.whatsappAlertsSub': 'व्हाट्सएप पर सीधा स्टेटस अपडेट प्राप्त करें।',
    'settings.weeklyDigest': 'साप्ताहिक गतिविधि सारांश',
    'settings.weeklyDigestSub': 'सक्रिय अनुरोधों की साप्ताहिक रिपोर्ट प्राप्त करें।',
    'settings.languageLabel': 'पसंदीदा पोर्टल भाषा',
    'settings.timezoneLabel': 'समय क्षेत्र',
    'settings.autoLogoutLabel': 'ऑटो लॉगआउट निष्क्रयता',
    'settings.savedSuccess': 'सेटिंग्स सफलतापूर्वक अपडेट की गईं!',

    // Book Appointment Wizard
    'book.step1Label': 'सेवा',
    'book.step2Label': 'विवरण',
    'book.step3Label': 'दस्तावेज़ (वैकल्पिक)',
    'book.step4Label': 'समीक्षा',
    'book.step5Label': 'पुष्टि',
    'book.step1Header': 'चरण 1: सेवा चुनें',
    'book.step1Sub': 'उस प्राथमिक सेवा को चुनें जिसके लिए आपको अपॉइंटमेंट चाहिए।',
    'book.searchServicePlaceholder': 'नाम से सेवा खोजें...',
    'book.step2Header': 'चरण 2: अपॉइंटमेंट विवरण और समय सारणी',
    'book.step2Sub': 'परामर्श का अपना पसंदीदा तरीका, तिथि और समय स्लॉट चुनें।',
    'book.step3Header': 'चरण 3: दस्तावेज़ अपलोड (वैकल्पिक)',
    'book.step3Sub': 'प्रसंस्करण को तेज़ करने के लिए प्रासंगिक पहचान पत्र संलग्न करें।',
    'book.step4Header': 'चरण 4: बुकिंग सारांश की समीक्षा करें',
    'book.step4Sub': 'अंतिम जमा करने से पहले सभी विवरणों को सत्यापित करें।',
    'book.step5Header': 'चरण 5: पुष्टि',
    'book.aptBookedTitle': 'अपॉइंटमेंट सफलतापूर्वक निर्धारित किया गया!',
    'book.bookAnother': 'दूसरा अपॉइंटमेंट बुक करें',
    'book.viewMyApts': 'मेरे अपॉइंटमेंट्स देखें',

    // Appointments Page
    'apts.statTotal': 'कुल अपॉइंटमेंट्स',
    'apts.statTotalSub': 'बुक किए गए सत्र',
    'apts.statConfirmed': 'पुष्ट स्लॉट',
    'apts.statConfirmedSub': 'सक्रिय बुकिंग',
    'apts.statCompleted': 'पूरे किए गए सत्र',
    'apts.statCompletedSub': 'समाप्त',
    'apts.statRescheduled': 'पुनर्निर्धारित / रद्द',
    'apts.statRescheduledSub': 'संशोधित स्लॉट',
    'apts.searchPlaceholder': 'अपॉइंटमेंट्स खोजें...',
    'apts.bookAptBtn': '+ अपॉइंटमेंट बुक करें',

    // Documents Page
    'docs.statTotal': 'कुल दस्तावेज़',
    'docs.statTotalSub': 'वॉल्ट में एन्क्रिप्टेड',
    'docs.statApproved': 'स्वीकृत / सत्यापित',
    'docs.statApprovedSub': 'अधिकारी द्वारा सत्यापित',
    'docs.statReview': 'समीक्षाधीन',
    'docs.statReviewSub': 'सत्यापन लंबित',
    'docs.statLinked': 'लिंक किए गए आवेदन',
    'docs.statLinkedSub': 'सक्रिय फ़ोल्डर',
    'docs.uploadHeader': 'आधिकारिक दस्तावेज़ अपलोड करें',
    'docs.uploadSub': 'फ़ाइलें एन्क्रिप्टेड और सुरक्षित रूप से संग्रहीत हैं।',
    'docs.appLabel': 'आवेदन',
    'docs.docTypeLabel': 'दस्तावेज़ प्रकार',
    'docs.browseUploadBtn': '+ ब्राउज़ करें और अपलोड करें',
    'docs.yourDocsHeader': 'आपके दस्तावेज़',

    // Applications Page
    'apps.statTotal': 'कुल अनुरोध',
    'apps.statTotalSub': 'सबमिट किए गए',
    'apps.statProgress': 'प्रगति पर है',
    'apps.statProgressSub': 'प्रसंस्करण के तहत',
    'apps.statApproved': 'स्वीकृत',
    'apps.statApprovedSub': 'पूरा हुआ और जारी किया गया',
    'apps.statPending': 'लंबित कार्यवाही',
    'apps.statPendingSub': 'ध्यान देने की आवश्यकता है',
    'apps.searchPlaceholder': 'आईडी या सेवा द्वारा आवेदन खोजें...',
    'apps.newAppBtn': '+ नया आवेदन',

    // Payments Page
    'pay.statTotal': 'कुल व्यय',
    'pay.statTotalSub': 'लाइफटाइम बिलिंग',
    'pay.statSuccess': 'सफल भुगतान',
    'pay.statSuccessSub': 'सत्यापित रसीदें',
    'pay.statPending': 'लंबित चालान',
    'pay.statPendingSub': 'देय भुगतान',
    'pay.statRefunds': 'रिफंड / समायोजन',
    'pay.statRefundsSub': 'संसाधित क्रेडिट',
    'pay.searchPlaceholder': 'लेनदेन संदर्भ द्वारा रसीदें खोजें...',
    'pay.exportPdfBtn': 'पीडीएफ विवरण निर्यात करें',
  }
};

const DEFAULT_PREFERENCES: PreferencesState = {
  whatsappAlerts: true,
  emailAlerts: true,
  smsAlerts: true,
  weeklyDigest: false,
  language: 'English',
  timezone: 'Asia/Kolkata (IST +5:30)',
  autoLogout: '30 minutes'
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<PreferencesState>(DEFAULT_PREFERENCES);

  // Load preferences from localStorage per user
  useEffect(() => {
    try {
      const storageKey = getUserStorageKey(user?.email, 'amman_portal_preferences');
      const saved = localStorage.getItem(storageKey) || localStorage.getItem('amman_portal_preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        setPreferences({
          ...DEFAULT_PREFERENCES,
          ...parsed,
        });
      }
    } catch (e) {
      console.error('Error loading preferences from localStorage:', e);
    }
  }, [user?.email]);

  const updatePreferences = (updates: Partial<PreferencesState>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      try {
        const storageKey = getUserStorageKey(user?.email, 'amman_portal_preferences');
        localStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem('amman_portal_preferences', JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving preferences to localStorage:', e);
      }
      return updated;
    });
  };

  const setLanguage = (lang: SupportedLanguage) => {
    updatePreferences({ language: lang });
  };

  const setWhatsappAlerts = (enabled: boolean) => {
    updatePreferences({ whatsappAlerts: enabled });
  };

  const t = (key: string): string => {
    const langDict = TRANSLATIONS[preferences.language] || TRANSLATIONS.English;
    return langDict[key] || TRANSLATIONS.English[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        language: preferences.language,
        setLanguage,
        whatsappAlerts: preferences.whatsappAlerts,
        setWhatsappAlerts,
        preferences,
        updatePreferences,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
