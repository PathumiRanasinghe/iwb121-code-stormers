import { useState, useRef, useEffect } from "react";
import {
  TextField,
  Typography,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";
import {
  ContentContainer,
  TitleBox,
  FormContainer,
  CardButton,
} from "../../components/Card";
import axios from "axios";
import HospitalLogo from "../../assets/logo.png";

const LipidPanelPage = () => {
  const [formData, setFormData] = useState({
    cholesterol: '',
    triglycerides: '',
    hdl: '',
    ldl: '',
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState({});
  const reportRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^\d*\.?\d*$/;

    if (regex.test(value) || value === '') {
      setFormData({
        ...formData,
        [name]: value
      });
      setError(prev => ({ ...prev, [name]: '' }));
    } else {
      setError(prev => ({ ...prev, [name]: `${name} must be a valid number.` }));
    }
  };

  const validateInput = () => {
    let isValid = true;
    const newError = {};

    for (const key in formData) {
      if (formData[key] === '') {
        newError[key] = `${key} cannot be empty.`;
        isValid = false;
      }
    }

    setError(newError);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateInput()) {
      return;
    }

    const requestData = {
      cholesterol: parseFloat(formData.cholesterol),
      triglycerides: parseFloat(formData.triglycerides),
      hdl: parseFloat(formData.hdl),
      ldl: parseFloat(formData.ldl)
    };

    try {
      const response = await axios.post('http://localhost:9090/api/analyzeLipidPanel', requestData);
      const interpretations = response.data;
      setReport(interpretations);
      setError({});
    } catch (error) {
      console.error('Error submitting data to the backend:', error);
      setError({ general: 'Failed to send data to the backend.' });
    }
  };

  useEffect(() => {
    if (report && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [report]);

  const expectedRanges = {
    cholesterol: "Less than 200 mg/dL",
    triglycerides: "Less than 150 mg/dL",
    hdl: "60 mg/dL or higher",
    ldl: "Less than 100 mg/dL",
  };


  return (
    <ContentContainer>
      <TitleBox>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 900, fontSize: '50px', color: '#034c81' }}>
          Lipid Panel Report Analyzer
        </Typography>
      </TitleBox>

      <FormContainer>
        <form onSubmit={handleSubmit} className="form" style={{ width: '100%' }}>
          {['cholesterol', 'triglycerides', 'hdl', 'ldl'].map((field) => (
            <TextField
              key={field}
              required
              fullWidth
              variant="outlined"
              margin="normal"
              name={field}
              label={`${field.charAt(0).toUpperCase() + field.slice(1)} (mg/dL)`}
              value={formData[field]}
              onChange={handleChange}
              error={!!error[field]}
              helperText={error[field]}
              sx={{ marginBottom: '16px' }}
            />
          ))}
          <CardButton type="submit">
            Analyze
          </CardButton>
        </form>
      </FormContainer>

      {/* Report Card Section */}
      {report && (
        <Card
          ref={reportRef}
          sx={{
            border: "1px solid #004c8c",
            width: "100%",
            maxWidth: "800px",
            boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            backgroundColor: "rgba(255, 255, 255,0.9)",
          }}
        >
          <CardContent>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", backgroundColor: "#c6e6fb" }}>
              <img src={HospitalLogo} alt="Hospital Logo" style={{ width: "100px" }} />
              <div style={{ textAlign: "right", marginLeft: "40px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>WELLNESS 360</Typography>
                <Typography variant="body2">wellness360@gmail.com</Typography>
                <Typography variant="body2">University of Moratuwa</Typography>
                <Typography variant="body2">Phone: +94 123456789</Typography>
              </div>
              <div style={{ textAlign: "right" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Patient Information</Typography>
                <Typography variant="body1">Name: [Name]</Typography>
                <Typography variant="body1">Email: [Email]</Typography>
                <Typography variant="body1">Date: {new Date().toLocaleDateString()}</Typography>
              </div>
            </div>

            <Typography variant="h6" sx={{ fontWeight: "600", color: "#004c8c", fontSize: "28px", marginBottom: "20px", textAlign: "center" }}>
              Lipid Panel Test Results
            </Typography>

            <TableContainer component={Paper}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Test</strong></TableCell>
                    <TableCell align="right" sx={{ width: "150px" }}><strong>Expected Range</strong></TableCell>
                    <TableCell align="right" sx={{ width: "150px" }}><strong>Your Result</strong></TableCell>
                    <TableCell align="right"><strong>Status</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Object.keys(expectedRanges).map((key, index) => (
                    <TableRow key={key}>
                      <TableCell component="th" scope="row">{key.charAt(0).toUpperCase() + key.slice(1)}</TableCell>
                      <TableCell align="right">{expectedRanges[key]}</TableCell>
                      <TableCell align="right">{formData[key]}</TableCell>
                      <TableCell align="right" style={{ color: report[index]?.color }}>
                        {renderColoredCircle(report[index]?.color)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                marginTop: "20px",
                marginBottom: "20px",
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", margin: "0 20px" }}
              >
                {ColoredCircle("red")}
                <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                  High
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", margin: "0 20px" }}
              >
                {ColoredCircle("green")}
                <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                  Normal
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", margin: "0 20px" }}
              >
                {ColoredCircle("blue")}
                <Typography variant="body1" sx={{ marginLeft: "8px" }}>
                  Low
                </Typography>
              </Box>
            </Box>
            <Box sx={{ marginTop: "30px", textAlign: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#004c8c", fontSize: "24px", marginBottom: "16px" }}>
                Analysis Summary
              </Typography>
              {report.map((item, index) => (
                <Typography key={index} variant="body2" sx={{ textAlign: "left", marginLeft: "8px", fontSize: "16px", lineHeight: "1.5" }}>
                  • {item.text}
                </Typography>
              ))}
            </Box>
            </CardContent>
            <Typography
            variant="body1"
            sx={{
              color: "#004c8c", 
              fontSize: "16px",
              lineHeight: "1.5",
              borderTop: "2px solid #004c8c",
              margin: "20px",
            }}
          >
        
            We appreciate your trust in our services. If you have any questions
            or require further assistance, please do not hesitate to contact us.
            <br />
            Explore our comprehensive range of offerings:{" "}
            <a
              href="http://localhost:5173/services"
              style={{
                color: "#004c8c",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
            >
              View Our Services
            </a>
          </Typography>
          
        </Card>
      )}
      {/* PDF Generation Button */}
      {report && (
        <div style={{ textAlign: "center" }}>
          <CardButton onClick={getPDF} type="button">
          Download Report as PDF
          </CardButton>
        </div>
      )}

      {/* Display error messages if there are any */}
      {Object.keys(error).length > 0 && (
        <div style={{ color: "red", marginTop: "20px" }}>
          {Object.values(error).map((errMsg, index) => (
            <div key={index}>{errMsg}</div>
          ))}
        </div>
      )}
    </ContentContainer>
  );
};

export default LipidPanelPage;
const renderColoredCircle = (color) => (
  <span
    style={{
      display: "inline-block",
      width: "30px",
      height: "30px",
      borderRadius: "50%",
      backgroundColor: color,
    }}
  ></span>
);

const ColoredCircle = (color) => (
  <span
    style={{
      display: "inline-block",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: color,
    }}
  ></span>);