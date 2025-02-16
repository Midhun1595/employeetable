import React, { useState, useEffect, useRef } from "react";
import { Input, Switch, Button, Select, Modal } from "antd";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community";

// Register required modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const { Option } = Select;

const EmployeeTable = () => {
  const [employees, setEmployees] = useState([]);
  //const [localEmployees, setLocalEmployees] = useState(JSON.parse(localStorage.getItem("employees")) || []);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [statusFilter, setStatusFilter] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const gridRef = useRef();

  // Fetch employees from MongoDB
  useEffect(() => {
    fetchEmployees();
  }, []);

  // useEffect(() => {
  //   localStorage.setItem("employees", JSON.stringify(localEmployees));
  // }, [localEmployees]);

  // useEffect(() => {
  //   localEmployees.forEach(async (emp) => {
  //     await axios.post("http://localhost:5000/employees", emp);
  //   });
  //   setLocalEmployees([]);
  //   localStorage.removeItem("employees");
  // }, []);


  const fetchEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:5000/employees");
      setEmployees(response.data);
      setFilteredEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  // Filter employees based on search criteria
  useEffect(() => {
    let filtered = employees.filter(
      (emp) =>
        emp.name?.toLowerCase().includes(searchText.toLowerCase()) &&
        (selectedDepartment ? emp.department === selectedDepartment : true) &&
        (statusFilter !== null ? emp.status === (statusFilter ? "Active" : "Inactive") : true)
    );
    setFilteredEmployees(filtered);
  }, [searchText, selectedDepartment, statusFilter, employees]);

  // Delete employee from MongoDB
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await axios.delete(`http://localhost:5000/employees/${id}`);
      fetchEmployees();
    }
  };

  // Edit employee
  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setIsEdit(true);
    setIsModalOpen(true);
  };

  // Add new employee
  const handleAdd = () => {
    setEditingEmployee({ name: "", department: "", role: "", salary: "", status: "Inactive" });
    setIsEdit(false);
    setIsModalOpen(true);
  };

  // Save (add or update) employee
  const handleSave = async () => {
    if (isEdit) {
      await axios.put(`http://localhost:5000/employees/${editingEmployee._id}`, editingEmployee);
    } else {
      await axios.post("http://localhost:5000/employees", editingEmployee);
        //setLocalEmployees([...localEmployees, editingEmployee]);
    }
    setIsModalOpen(false);
    fetchEmployees();
  };

  // AG Grid Column Definitions
//   const columnDefs = [
//     { headerName: "ID", field: "_id" },
//     { headerName: "Name", field: "name" },
//     { headerName: "Department", field: "department" },
//     { headerName: "Role", field: "role" },
//     { headerName: "Salary", field: "salary" },
//     {
//       headerName: "Status",
//       field: "status",
//       cellRenderer: (params) => (
//         <Switch
//           checked={params.value === "Active"}
//           onChange={() =>
//             handleEdit({ ...params.data, status: params.value === "Active" ? "Inactive" : "Active" })
//           }
//         />
//       ),
//     },
//     {
//       headerName: "Actions",
//       field: "actions",
//       cellRenderer: (params) => (
//         <div>
//           <Button onClick={() => handleEdit(params.data)}>Edit</Button>
//           <Button onClick={() => handleDelete(params.data._id)} style={{ marginLeft: 5 }}>
//             Delete
//           </Button>
//         </div>
//       ),
//     },
//   ];

  return (
    <div>
      <h1>Employee Table</h1>
      <Input placeholder="Search by name" value = {searchText} onChange={(e) => setSearchText(e.target.value)} style={{ width: 200, marginRight: 10 }} />
      <Select placeholder="Select Department" onChange={setSelectedDepartment} style={{ width: 200, marginRight: 10 }}>
        <Option value="">All</Option>
        <Option value="HR">HR</Option>
        <Option value="IT">IT</Option>
        <Option value="NON-IT">NON-IT</Option>
      </Select>
      <Switch onChange={(checked) => setStatusFilter(checked)} /> Show Active Only
      <Button onClick={handleAdd}>Add Employee</Button>

      {/* AG Grid Table */}
      <div className="ag-theme-alpine" style={{ height: 400, width: "70%", marginTop: 20 }}>
      <AgGridReact ref={gridRef} rowData={employees} columnDefs={[
         { headerName: "ID", field: "_id" },
         { headerName: "Name", field: "name", sortable: true, filter: true },
         { headerName: "Department", field: "department" },
         { headerName: "Role", field: "role" },
         { headerName: "Salary", field: "salary" },
         {
           headerName: "Status", field: "status",
              cellRenderer: (params) => (
                    <Switch checked={params.value === "Active"}
                       onChange={() => handleEdit({ ...params.data, status: params.value === "Active" ? "Inactive" : "Active" })
                       } />)
        },
         
        {
           headerName: "Actions",
           field: "actions",
           cellRenderer: (params) => (
             <div>
               <Button className="btn btn-primary" onClick={() => handleEdit(params.data)}>Edit</Button>
               <Button className="btn btn-danger" onClick={() => handleDelete(params.data._id)} style={{ marginLeft: 5 }}>
                 Delete
               </Button>
             </div>
           )
         }
        
      ]} pagination={true} paginationPageSize={5}
      onGridReady={(params) => gridRef.current = params.api}
      quickFilterText={searchText} />
      </div>

      {/* Modal for Adding/Editing Employee */}
      <Modal title={isEdit ? "Edit Employee" : "Add Employee"} open={isModalOpen} onOk={handleSave} onCancel={() => setIsModalOpen(false)}>
        <Input placeholder="Name" value={editingEmployee?.name || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })} />
        <Input placeholder="Department" value={editingEmployee?.department || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })} />
        <Input placeholder="Role" value={editingEmployee?.role || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })} />
        <Input placeholder="Salary" value={editingEmployee?.salary || ""} onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })} />
        <Select placeholder="Select Status" value={editingEmployee?.status} onChange={(value) => setEditingEmployee({ ...editingEmployee, status: value })}>
          <Option value="Active">Active</Option>
          <Option value="Inactive">Inactive</Option>
        </Select>
      </Modal>
    </div>
  );
};

export default EmployeeTable;
