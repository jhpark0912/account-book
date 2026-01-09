# Code Style and Conventions

## Backend (Python/FastAPI)

### File Structure
- Router files in `app/routers/`
- Models in `app/models.py`
- Schemas in `app/schemas.py`
- Database config in `app/database.py`

### Naming Conventions
- **Files**: lowercase with underscores (`transactions.py`, `categories.py`)
- **Classes**: PascalCase (`Transaction`, `CategoryMapping`)
- **Functions**: snake_case (`get_transactions`, `auto_categorize`)
- **Variables**: snake_case

### Pydantic Schemas
- Base schemas end with `Base` (`TransactionBase`)
- Create schemas end with `Create` (`TransactionCreate`)
- DB model schemas use plain name (`Transaction`)
- Use `Optional[]` for nullable fields
- Include `Config` class with `from_attributes = True` for ORM models

### FastAPI Patterns
```python
@router.get("/path", response_model=SchemaName)
def endpoint_name(
    param: type,
    db: Session = Depends(get_db)
):
    """Docstring describing endpoint"""
    # Implementation
```

### Error Handling
```python
raise HTTPException(status_code=404, detail="Error message")
```

### Logging
- Use Python's `logging` module
- Log level: INFO for requests, ERROR for exceptions
- Include context in error messages

## Frontend (React/JavaScript)

### File Structure
- Components in `src/components/`
- API services in `src/api/`
- Main app in `src/App.jsx`

### Naming Conventions
- **Files**: PascalCase for components (`TransactionTable.jsx`)
- **Components**: PascalCase function names
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `COLORS`)

### React Patterns
```javascript
function ComponentName({ props }) {
  const [state, setState] = useState(initial);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  return (
    // JSX
  );
}

export default ComponentName;
```

### ESLint Rules
- No unused variables (except uppercase constants)
- React hooks rules enforced
- ECMAVersion: 2020
- Module type: ES modules

### Styling
- Use TailwindCSS utility classes
- Responsive classes: `sm:`, `md:`, `lg:`
- Color scheme: blue (primary), red (errors), green (success)

### API Calls
- Use axios instance from `accountService.js`
- Handle errors with try/catch
- Display user-friendly error messages
- Include loading states

### State Management
- Props for parent-child communication
- `refreshTrigger` pattern for data refreshing
- Local state for UI interactions

## Comments
- **Korean**: UI text, user-facing messages, and comments in JSX
- **English**: Code comments, function names, variable names
- Document complex logic and business rules
