# Create README.md content
**CMPT 272 – Assignment 2**  
**Jiachen Sun**

---

## 📌 Project Overview

The **Interactive Catalog Viewer** is a fully client-side web application built using **vanilla JavaScript**, **Bootstrap 5**, and **custom CSS**.

This application allows users to upload a CSV file containing catalog data and interactively explore the items through searching, filtering, sorting, and viewing detailed information.

All core functionality (CSV parsing, filtering logic, sorting logic, and DOM updates) is implemented manually without using external JavaScript libraries.

---

## 📂 Expected CSV Format

The application requires a CSV file with the following exact header:

```
title,type,author,year,genre,rating,description
```

Example:

```
Clean Code,book,Robert C. Martin,2008,Software Engineering,4.7,A handbook of agile software craftsmanship.
```

### Data Requirements
- `year` must be numeric
- `rating` must be numeric
- All fields must be present
- Header must match exactly

If the format is incorrect, the application will display an error message.

---

## 🚀 Features

### ✅ CSV Parsing & Data Model
- Parses uploaded CSV files using vanilla JavaScript
- Validates header format
- Converts numeric fields properly
- Displays helpful error messages for invalid files
- Stores data using structured JavaScript objects

---

### ✅ Dynamic Filtering
- Search by title or author
- Filter by **Type**
- Filter by **Genre**
- Genre filter updates dynamically based on selected Type  
  - If Type = *All*, all genres are available  
  - If Type = specific type, only genres belonging to that type are shown

---

### ✅ Sorting
Users can sort catalog items by:
- Title (A–Z / Z–A)
- Year (Newest / Oldest)
- Rating (Highest / Lowest)

Sorting is applied after filtering and updates the display dynamically.

---

### ✅ Dynamic DOM Updates
- Items render dynamically without page reload
- Results update immediately when filters or sorting change
- Displays number of matching items
- Shows active filter summary
- Displays empty-state message when no results are found

---

### ✅ Modal Details View
- Clicking a card opens a Bootstrap modal
- Displays full item information
- Scrollable modal body
- Keyboard accessible (Enter / Space support)

---

### ✅ Dark Mode Toggle 🌙
- Implemented using Bootstrap 5.3 `data-bs-theme`
- Toggle button located in the navigation bar
- Theme preference saved using `localStorage`
- Switches between Light Mode and Dark Mode instantly

---

## 🎨 UI & Design

- Built with **Bootstrap 5**
- Responsive grid layout
- Card-based item display
- Custom badge styling
- Hover effects for better interactivity
- Clean spacing and alignment
- Consistent visual hierarchy

The interface emphasizes usability, clarity, and responsiveness across different screen sizes.

---

## 🛠 Technologies Used

- HTML5
- CSS3
- Bootstrap 5.3
- Vanilla JavaScript (ES6)
- DOM Manipulation API

No external JavaScript frameworks or CSV libraries were used.

---

## 🤖 AI Tools Used

The following tools were used to assist development:

- **GitHub Copilot**
  - Used for Bootstrap / CSS class name suggestions
  - Assisted with layout refinement
  - Provided minor code structure suggestions

- **Genmoji (Apple)**
  - Used to generate the custom icon used in the application interface

All core logic including CSV parsing, filtering, sorting, and DOM manipulation was implemented manually.

---

## 📦 How to Run

1. Download the project files
2. Open `index.html` in a web browser
3. Upload a properly formatted CSV file
4. Use search, filters, sorting, and dark mode to interact with the catalog

No server setup or additional installation is required.

---

## 📊 Rubric Coverage

This project satisfies the following assignment criteria:

- CSV Parsing & Data Model
- Dynamic Filtering
- Sorting
- Dynamic DOM Updates
- UI, Bootstrap Usage, and Code Organization
- Effort, Creativity, and Usability

---

## 📌 Notes

- The application runs entirely on the client side.
- No external parsing libraries were used.
- Bootstrap is used strictly for layout and styling.
- The project focuses on both functionality and clean design.
