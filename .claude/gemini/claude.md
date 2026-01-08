## Claude's Task: Implement Transaction Category Mapping Management

**Objective:** Enhance the existing account book application by adding functionality for an administrator to manage "거래처" (vendor/client) to transaction category mappings. This will allow for more accurate and automated categorization of transactions based on the transaction description.

**Current State of the Project:**

*   **Backend (Python - FastAPI):**
    *   `backend/app/models.py`: Contains `Transaction` and `CategoryMapping` models. The `CategoryMapping` model has `id`, `keyword` (for "거래처" or a part of it), and `category`.
    *   `backend/app/schemas.py`: Contains `CategoryMappingBase`, `CategoryMappingCreate`, and `CategoryMapping` Pydantic schemas for the `CategoryMapping` model.
    *   `backend/app/routers/transactions.py`: Includes an `auto_categorize` function that uses the `CategoryMapping` model to suggest a category based on the transaction's description.
    *   `backend/app/main.py`: The main FastAPI application.
*   **Frontend (React):**
    *   Standard React project structure with components, pages, constants, and API service files.

**Tasks for Claude:**

1.  **Backend Implementation:**
    *   **Create a new router:**
        *   Create a new file: `backend/app/routers/mappings.py`.
        *   Implement CRUD (Create, Read, Update, Delete) endpoints for `CategoryMapping` within this file.
        *   **Endpoints to implement:**
            *   `POST /api/mappings`: Create a new `CategoryMapping`.
            *   `GET /api/mappings`: Retrieve all `CategoryMapping` entries.
            *   `PUT /api/mappings/{mapping_id}`: Update an existing `CategoryMapping` by ID.
            *   `DELETE /api/mappings/{mapping_id}`: Delete a `CategoryMapping` by ID.
        *   Each endpoint should use `schemas.CategoryMappingCreate` for input (where applicable) and `schemas.CategoryMapping` for output.
    *   **Integrate the new router:**
        *   Modify `backend/app/main.py` to import and include the new `mappings` router.
        *   The `prefix` for this router should be `/api` and the `tags` should be `["Mappings"]`.

2.  **Frontend Implementation:**
    *   **Create a new API service:**
        *   Create a new file `frontend/src/api/mappingService.js`.
        *   Implement functions to interact with the new `CategoryMapping` backend API endpoints (create, read, update, delete).
    *   **Create a new React component for management:**
        *   Create a new file `frontend/src/components/CategoryMappingManagement.jsx`.
        *   This component should provide a UI for administrators to:
            *   View all existing "거래처"-category mappings in a table.
            *   Add new mappings (input fields for `keyword` and `category`). The category input should ideally use the `TransactionCategory` enum from `frontend/src/constants/transactionCategories.js`.
            *   Edit existing mappings.
            *   Delete mappings.
            *   Include basic form validation and error handling.
    *   **Integrate the management component:**
        *   Decide on an appropriate location within the `frontend/src/pages` directory (or create a new one, e.g., `frontend/src/pages/AdminPage.jsx`) to integrate the `CategoryMappingManagement` component.
        *   Add a navigation link to this new management page/component if a navigation structure exists (e.g., in `App.jsx` or a dedicated `Header`/`Sidebar` component). If not, simply render the component on a new route.
    *   **Enhance TransactionTable/TransactionDisplay:**
        *   Review `frontend/src/components/TransactionTable.jsx` and any other relevant components that display transactions.
        *   Ensure that automatically categorized transactions (based on the `CategoryMapping`) are displayed correctly. No direct changes to categorization logic are needed on the frontend, just display.

3.  **Documentation:**
    *   Update `README.md` (or create a new `ADMIN_GUIDE.md`) to include instructions on how administrators can use the new category mapping management feature. Explain:
        *   What the feature does (auto-categorization based on "거래처").
        *   How to access the admin interface.
        *   How to add, edit, and delete mappings.

**Important Considerations for Claude:**

*   **Maintain existing conventions:** Follow the current coding style, directory structure, and architectural patterns of the project.
*   **Error Handling:** Implement robust error handling for both backend API calls and frontend UI interactions.
*   **User Experience:** Design the frontend management interface to be intuitive and user-friendly for an administrator.
*   **Dependencies:** Use existing libraries and frameworks (`FastAPI`, `React`, `axios` or `fetch`, `tailwind.css` if used) without introducing new ones unless absolutely necessary and justified.
*   **Code Comments:** Add comments where necessary to explain complex logic, especially for the frontend components.

By following these instructions, Claude should be able to implement the requested feature effectively.

read memory: category_mapping_implementation_progress