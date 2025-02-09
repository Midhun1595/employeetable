import React, { useState, useEffect, useRef } from "react";
import { Input, Switch, Button, Select, Modal } from "antd";
import { 
  AgGridReact 
} from "ag-grid-react";
import { 
  ModuleRegistry 
} from "ag-grid-community";
import { 
  ClientSideRowModelModule 
} from "ag-grid-community";

// Register required modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);


const { Option } = Select;

const EmployeeTable = () => {
  const [employees, setEmployees] = useState(() => {
    const savedEmployees = localStorage.getItem("employees");
    return savedEmployees ? JSON.parse(savedEmployees) : [];
  });

  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const gridRef = useRef();

  // Save to localStorage whenever employees change
  useEffect(() => {
    localStorage.setItem("employees", JSON.stringify(employees));
    filterEmployees();
  }, [employees, searchText, selectedDepartment, statusFilter]);

  const filterEmployees = () => {
    let filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedDepartment ? emp.department === selectedDepartment : true) &&
        (statusFilter !== null ? emp.status === (statusFilter ? "Active" : "Inactive") : true)
    );
    setFilteredEmployees(filtered);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
    setEmployees((prevEmployees) => prevEmployees.filter((emp) => emp.id !== id));
  }
};

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setIsEdit(false);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (isEdit) {
      setEmployees((prev) => prev.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp)));
    } else {
      setEmployees((prev) => [...prev, { ...editingEmployee, id: prev.length + 1 }]);
    }
    setIsModalOpen(false);
  };

  // AG Grid Column Definitions
  const columnDefs = [
    { headerName: "ID", field: "id", sortable: true, filter: "agNumberColumnFilter" },
    { headerName: "Name", field: "name", sortable: true, filter: "agTextColumnFilter" },
    { headerName: "Department", field: "department", sortable: true, filter: "agTextColumnFilter" },
    { headerName: "Role", field: "role", sortable: true, filter: "agTextColumnFilter" },
    { headerName: "Salary", field: "salary", sortable: true, filter: "agNumberColumnFilter" },
    {
      headerName: "Status",
      field: "status",
      cellRenderer: (params) => (
        <Switch
          checked={params.value === "Active"}
          onChange={() => handleEdit({ ...params.data, status: params.value === "Active" ? "Inactive" : "Active" })}
        />
      ),
      filter: "agTextColumnFilter",
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: (params) => (
        <div>
          <Button className="btn btn-primary" onClick={() => handleEdit(params.data)}>Edit</Button>
          <Button className="btn btn-danger" onClick={() => handleDelete(params.data.id)} style={{ marginLeft: 5 }}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <h1>Employee Table</h1>
      <Input className="btn btn-search" placeholder="Search by name" onChange={(e) => setSearchText(e.target.value)} style={{ marginRight: 10, width: 200 }} />
      <Select placeholder="Select Department" onChange={setSelectedDepartment} style={{ width: 200, marginRight: 10 }}>
        <Option value="">All</Option>
        <Option value="HR">HR</Option>
        <Option value="IT">IT</Option>
      </Select>
      <Switch onChange={(checked) => setStatusFilter(checked)} style={{ marginRight: 10 }} /> Show Active Only
      <Button className="btn btn-add" onClick={handleAdd}>Add Employee</Button>

      {/* AG Grid Table */}
      <div className="ag-theme-alpine" style={{ height: 400, width: "70%", marginTop: 20 }}>
        
        <AgGridReact
          ref={gridRef}
          rowData={filteredEmployees}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={5}
          domLayout="autoHeight"
        />
      </div>

      <Modal title={isEdit ? "Edit Employee" : "Add Employee"} open={isModalOpen} onOk={handleSave} onCancel={() => setIsModalOpen(false)}>
        <label>Name: <Input value={editingEmployee?.name || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} /></label><br />
        <label>Department: <Input value={editingEmployee?.department || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} /></label><br />
        <label>Role: <Input value={editingEmployee?.role || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })} /></label><br />
        <label>Salary: <Input type="number" value={editingEmployee?.salary || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })} /></label><br />
        <label>Status:
          <Select value={editingEmployee?.status || "Active"} onChange={(value) => setEditingEmployee({ ...editingEmployee, status: value })}>
            <Option value="Active">Active</Option>
            <Option value="Inactive">Inactive</Option>
          </Select>
        </label>
      </Modal>
    </div>
  );
};

export default EmployeeTable;
