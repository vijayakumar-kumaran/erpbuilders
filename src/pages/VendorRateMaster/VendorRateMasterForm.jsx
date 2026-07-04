import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  IconButton,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import AddIcon from "@mui/icons-material/Add";
import dayjs from "dayjs";
import MaterialDropdown from "../../components/reusable/TypeAheadDrop";
import axios from "axios";
import API_URL from "../../config";

const VendorRateMasterForm = ({ open, onClose, onSave, editData }) => {
  const [vendorName, setVendorName] = useState("");
  const [vendorCode, setVendorCode] = useState("");
  const [vendorList, setVendorList] = useState([]);
  const [startDate, setStartDate] = useState(dayjs());
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("Active");
  const [materials, setMaterials] = useState([]);
  const [materialRows, setMaterialRows] = useState([
    {
      materialCategory: "",
      materialSubCategory: "",
      materialCode: "",
      materialName: "",
      uom: "",
      rate: "",
      sourceqty: "",
    },
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Load vendors and materials once dialog opens
      axios.get(`${API_URL}/api/masters/vendors`).then((res) => setVendorList(res.data));
      axios.get(`${API_URL}/api/masters/materials/all`).then((res) => setMaterials(res.data));

      // If editing, prefill the form
      if (editData) {
        setVendorName(editData.vendorName);
        setVendorCode(editData.vendorCode);
        setStartDate(editData.startDate ? dayjs(editData.startDate) : dayjs());
        setEndDate(editData.endDate ? dayjs(editData.endDate) : null);
        setStatus(editData.status || "Active");
        setMaterialRows(editData.materialNames || []);
      } else {
        resetForm();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editData]);

  const resetForm = () => {
    setVendorName("");
    setVendorCode("");
    setStartDate(dayjs());
    setEndDate(null);
    setStatus("Active");
    setMaterialRows([
      {
        materialCategory: "",
        materialSubCategory: "",
        materialCode: "",
        materialName: "",
        uom: "",
        rate: "",
        sourceqty: "",
      },
    ]);
  };

  const handleVendorChange = (vendorId) => {
    const selected = vendorList.find((v) => v._id === vendorId);
    if (selected) {
      setVendorName(selected.vendorName);
      setVendorCode(selected.vendorCode);
    } else {
      setVendorName("");
      setVendorCode("");
    }
  };

  const handleMaterialChange = (index, field, value) => {
    const updated = [...materialRows];
    updated[index][field] = value;

    if (field === "materialName") {
      const match = materials.find((m) => m.materialName === value);
      if (match) {
        updated[index] = {
          ...updated[index],
          materialCategory: match.materialCategory,
          materialSubCategory: match.materialSubCategory,
          materialCode: match.materialCode,
          materialName: match.materialName,
          uom: match.uom,
        };
      }
    }
    setMaterialRows(updated);
  };

  const handleAddRow = () => {
    setMaterialRows([
      ...materialRows,
      {
        materialCategory: "",
        materialSubCategory: "",
        materialCode: "",
        materialName: "",
        uom: "",
        rate: "",
        sourceqty: "",
      },
    ]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      // Validate required fields here as needed

      // Prepare data payload
      const payload = {
        vendorCode,
        vendorName,
        startDate,
        endDate,
        status,
        materialNames: materialRows.map((m) => ({
          ...m,
          rate: Number(m.rate),
          sourceqty: Number(m.sourceqty),
        })),
      };

      if (editData && editData._id) {
        // Update existing
        await axios.put(`${API_URL}/api/masters/rate/update/${editData._id}`, payload);
      } else {
        // Create new
        await axios.post(`${API_URL}/api/masters/ven-rate/create`, payload);
      }

      onSave(); // Refresh parent list and close modal
      resetForm();
    } catch (err) {
      alert("Failed to save vendor rate data. " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
        <DialogTitle>{editData ? "Edit Vendor Rate" : "Add Vendor Rate"}</DialogTitle>
        <DialogContent dividers>
          <Box mb={3}>
            <Typography variant="subtitle1" fontWeight={600}>
              Vendor Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={6}>
                <MaterialDropdown
                  placeholder="Search Vendor Name..."
                  label="Vendor Name"
                  value={vendorName ? { label: vendorName, value: vendorCode } : null}
                  onChange={(selected) => {
                    if (selected) handleVendorChange(selected.value);
                    else {
                      setVendorName("");
                      setVendorCode("");
                    }
                  }}
                  onSearch={async (searchTerm) => {
                    if (!searchTerm || searchTerm.length < 2) return [];
                    const res = await axios.get(`${API_URL}/api/masters/vendors`, {
                      params: { search: searchTerm },
                    });
                    return res.data.map((v) => ({ label: v.vendorName, value: v._id }));
                  }}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField label="Vendor Code" value={vendorCode} disabled fullWidth />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="Start Date"
                  disablePast
                  value={startDate}
                  onChange={setStartDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <DatePicker
                  label="End Date"
                  disablePast
                  value={endDate}
                  onChange={setEndDate}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  select
                  label="Status"
                  fullWidth
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Materials & Rates
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {materialRows.map((row, idx) => (
              <Grid
                container
                spacing={1}
                key={idx}
                alignItems="center"
                sx={{
                  mb: 1,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: "#fefefe",
                  boxShadow: "0 1px 4px rgb(0 0 0 / 0.1)",
                }}
              >
                <Grid item xs={12} md={4}>
                  <MaterialDropdown
                    label="Material Name"
                    placeholder="Search Material..."
                    value={row.materialName ? { label: row.materialName, value: row.materialName } : null}
                    onChange={(selected) => {
                      handleMaterialChange(idx, "materialName", selected ? selected.label : "");
                    }}
                    onSearch={async (searchTerm) => {
                      if (!searchTerm || searchTerm.length < 2) return [];
                      const res = await axios.get(`${API_URL}/api/masters/materials/q`, {
                        params: { search: searchTerm },
                      });
                      return res.data.map((m) => ({ label: m.label, value: m.label }));
                    }}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField label="Code" value={row.materialCode} disabled fullWidth size="small" />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField label="Category" value={row.materialCategory} disabled fullWidth size="small" />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField label="Sub Category" value={row.materialSubCategory} disabled fullWidth size="small" />
                </Grid>
                <Grid item xs={12} md={1}>
                  <TextField label="UoM" value={row.uom} disabled fullWidth size="small" />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField
                    label="Rate"
                    type="number"
                    value={row.rate}
                    onChange={(e) => handleMaterialChange(idx, "rate", e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={1.5}>
                  <TextField
                    label="Source Qty"
                    type="number"
                    value={row.sourceqty}
                    onChange={(e) => handleMaterialChange(idx, "sourceqty", e.target.value)}
                    fullWidth
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={0.5} textAlign="center">
                  {idx === materialRows.length - 1 && (
                    <IconButton onClick={handleAddRow} color="primary" size="small" aria-label="Add material row">
                      <AddIcon />
                    </IconButton>
                  )}
                </Grid>
              </Grid>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default VendorRateMasterForm;
