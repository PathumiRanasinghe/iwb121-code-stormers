import { useState, useRef, useEffect } from "react";
import {
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import {
  ContentContainer,
  TitleBox,
  FormContainer,
  CardButton,
} from "../../components/Card";
import axios from "axios";
import generatePDF from "../../helpers/generatePDF";
import GetCookie from "../../hooks/getcookie"; 
import decryptHash from "../../helpers/decrypting";
import { SECRET_KEY } from "../../helpers/constants";
import ReportFooter from "../../components/Report/ReportFooter";
import ReportHeader from "../../components/Report/ReportHeader";
import StatusLegend from "../../components/Report/StatusLegend";
import ReportTable from "../../components/Report/ReportTable";

const ThyroidFunctionTests = () => {
  const [formData, setFormData] = useState({
    tsh: "",
    t3: "",
    t4: "",
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState({
    tsh: "",
    t3: "",
    t4: "",
  });
  const [userEmail, setUserEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const reportRef = useRef(null);

  const currentDate = new Date().toLocaleDateString();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const hashedemail = GetCookie("userEmail"); // Get email from cookies
        const email = decryptHash(hashedemail, SECRET_KEY);
        const response = await axios.post(
          "http://localhost:9090/api/userByEmail",
          { email }
        );
        const { firstName, lastName } = response.data;
        setUserEmail(email);
        setFullName(`${firstName} ${lastName}`);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const regex = /^\d*\.?\d*$/;

    if (regex.test(value) || value === "") {
      setFormData({
        ...formData,
        [name]: value,
      });
      setError((prevError) => ({
        ...prevError,
        [name]: "",
      }));
    } else {
      setError((prevError) => ({
        ...prevError,
        [name]: `${name} must be a valid number.`,
      }));
    }
  };

  const validateInput = () => {
    let isValid = true;
    const newError = {
      tsh: "",
      t3: "",
      t4: "",
    };

    for (const key in formData) {
      if (formData[key] === "") {
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
      tsh: parseFloat(formData.tsh),
      t3: parseFloat(formData.t3),
      t4: parseFloat(formData.t4),
    };

    try {
      const response = await axios.post(
        "http://localhost:9090/api/analyzeTFT",
        requestData
      );

      const interpretations = response.data;
      setReport(interpretations);
      setError({ tsh: "", t3: "", t4: "" });
    } catch (error) {
      console.error("Error submitting data to the backend:", error);
      setError({ tsh: "", t3: "", t4: "Failed to send data to the backend." });
    }
  };

  useEffect(() => {
    if (report && reportRef.current) {
      reportRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [report]);

  const expectedRanges = {
    tsh: "0.4 - 4.0 mIU/L",
    t3: "0.8 - 2.0 ng/mL",
    t4: "4.5 - 12.0 µg/dL",
  };

  const getPDF = () => {
    generatePDF(reportRef);
  };

  return (
    <ContentContainer>
      <TitleBox>
        <Typography
          variant="h4"
          component="h1"
          sx={{ fontWeight: 900, fontSize: "50px", color: "#034c81" }}
        >
          Thyroid Function Tests Analyzer
        </Typography>
      </TitleBox>

      <FormContainer>
        <form
          onSubmit={handleSubmit}
          className="form"
          style={{ width: "100%" }}
        >
          <TextField
            required
            fullWidth
            variant="outlined"
            margin="normal"
            name="tsh"
            label="TSH (mIU/L)"
            value={formData.tsh}
            onChange={handleChange}
            sx={{ marginBottom: "16px" }}
            error={!!error.tsh}
            helperText={error.tsh}
          />
          <TextField
            required
            fullWidth
            variant="outlined"
            margin="normal"
            name="t3"
            label="T3 (ng/mL)"
            value={formData.t3}
            onChange={handleChange}
            sx={{ marginBottom: "16px" }}
            error={!!error.t3}
            helperText={error.t3}
          />
          <TextField
            required
            fullWidth
            variant="outlined"
            margin="normal"
            name="t4"
            label="T4 (µg/dL)"
            value={formData.t4}
            onChange={handleChange}
            sx={{ marginBottom: "16px" }}
            error={!!error.t4}
            helperText={error.t4}
          />
          <CardButton type="submit">Analyze</CardButton>
        </form>
      </FormContainer>
      <br></br>
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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                backgroundColor: "#c6e6fb",
              }}
            >
              <ReportHeader fullName={fullName} userEmail={userEmail} currentDate={currentDate} />
            </div>

            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                color: "#004c8c",
                fontSize: "28px",
                marginBottom: "20px",
                textAlign: "center",
              }}
            >
              Analysis of Thyroid Function Test Results
            </Typography>
            <ReportTable
              headers={["Test", "Expected Range", "Your Result", "Status"]}
              rows={[
                [
                  "TSH",
                  expectedRanges.tsh,
                  `${formData.tsh} mIU/L`,
                  renderColoredCircle(report[0]?.color),
                ],
                [
                  "T3",
                  expectedRanges.t3,
                  `${formData.t3} ng/mL`,
                  renderColoredCircle(report[1]?.color),
                ],
                [
                  "T4",
                  expectedRanges.t4,
                  `${formData.t4} µg/dL`,
                  renderColoredCircle(report[2]?.color),
                ],
              ]}
            />
          
            <StatusLegend />
            <Box sx={{ marginTop: "30px", textAlign: "center" }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#004c8c",
                  fontSize: "24px",
                  marginBottom: "16px",
                }}
              >
                Analysis Summary
              </Typography>

              {report.map((item, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    textAlign: "left",
                    marginLeft: "8px",
                    fontSize: "16px",
                    lineHeight: "1.5",
                  }}
                >
                  • {item.text}
                </Typography>
              ))}
            </Box>
          </CardContent>
          <ReportFooter />     
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

export default ThyroidFunctionTests;
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
  ></span>
);
