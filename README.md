# IRO – Issues Reporting Outlet

A mini web-based system for **relating and reporting issues concerning AAUA students and the indigenes** of Akungba, Iwaro, Etioro, Ayegunle and neighbouring communities.

**Course:** CSC426 – Weekly Dev, Weekend 3 · **Lecturer:** Dr. O. O. Ajayi
**Developer:** Opeyemi Oyinlola · Computer Science, Adekunle Ajasin University, Akungba-Akoko

## Links
- **Live app:** https://opes1.github.io/iro-issues-reporting-outlet/
- **Questionnaire (Google Form):** https://docs.google.com/forms/d/e/1FAIpQLSfNxcsxj_8lGEy8-hLIunrGbpO-oMTkLg9Fx9R_VG9yFxxaCQ/viewform

## Features
- Report an issue as an **AAUA Student** or an **Indigene / Resident**
- **Anonymous reporting** for sensitive issues
- Categories (security, accommodation, student–indigene conflict, harassment, land, roads, water/electricity, sanitation, health) and priority levels
- Unique **tracking ID** (e.g. `IRO-7KQ2MX`) to follow up a report
- **Admin dashboard** (IRO Desk): statistics, filter/search, update status with response notes, delete

## Run it
No installation is needed. Open `app/index.html` in any browser, or visit the GitHub Pages link if it is enabled.
Demo admin login: **admin / iro2026** (for demonstration only).

> The prototype stores data in the browser (localStorage), so reports are visible only on the device where they were made.

## Repository structure
```
app/                      Web interface (HTML, CSS, JavaScript)
  index.html              Home
  report.html             Report an issue
  track.html              Track an issue
  admin.html              Admin login & dashboard
  assets/style.css
  assets/app.js           Issue, IssueStore, Auth classes + page logic
docs/
  IRO_SRS.docx            Software Requirements Specification (FR & NFR)
  IRO_Object_and_Code_Listing.docx
  diagrams/
    ishikawa_iro.drawio   Ishikawa (fishbone) diagram – opens in draw.io
    usecase_iro.drawio    Use-case diagram – opens in draw.io
    *.png / *.svg         Exported images
    IRO_Diagrams_Print.pdf  Both diagrams on landscape A4 for printing
  questionnaire/
    questionnaire.md      Questionnaire content and Google Form link
    create_form.gs        Apps Script that builds the Google Form
```

## Tech stack
HTML5 · CSS3 · Vanilla JavaScript · Browser localStorage · draw.io
