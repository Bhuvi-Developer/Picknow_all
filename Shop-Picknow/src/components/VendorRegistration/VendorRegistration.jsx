import React, { useState } from 'react';
import './VendorRegistration.css';
import axiosInstance from '../../api/axios.js';
import { useNavigate } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';

const VendorRegistrationContainer = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [currentStep, setCurrentStep] = useState(1);
    
    const [formData, setFormData] = useState({
        displayName: '',
        email: '',
        password: '',
        contact: '',
        address: '',
        aadharNumber: '',
        panNumber: '',
        gstNumber: '',
        fssaiNumber: '',
        bankAccountNumber: '',
        ifscCode: ''
    });

    const [files, setFiles] = useState({
        aadharPhoto: null,
        panPhoto: null,
        gstDocument: null,
        fssaiDocument: null
    });

    const steps = [
        { number: 1, title: 'Basic Information' },
        { number: 2, title: 'Document Information' },
        { number: 3, title: 'Bank Details' }
    ];

    const showSnackbar = (message, variant = 'success') => {
        enqueueSnackbar(message, { 
            variant,
            anchorOrigin: {
                vertical: 'top',
                horizontal: 'right',
            },
            autoHideDuration: 3000
        });
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (file) {
            if (file.size > maxSize) {
                showSnackbar('File size should not exceed 5MB', 'error');
                e.target.value = '';
                return;
            }

            const validTypes = {
                'aadharPhoto': ['image/jpeg', 'image/png'],
                'panPhoto': ['image/jpeg', 'image/png'],
                'gstDocument': ['image/jpeg', 'image/png', 'application/pdf'],
                'fssaiDocument': ['image/jpeg', 'image/png', 'application/pdf']
            };

            if (!validTypes[e.target.name].includes(file.type)) {
                showSnackbar(`Please upload valid ${e.target.name} file`, 'error');
                e.target.value = '';
                return;
            }

            setFiles(prev => ({
                ...prev,
                [e.target.name]: file
            }));
        }
    };

    const validateStep = (step) => {
        switch (step) {
            case 1:
                if (!formData.displayName.trim()) {
                    showSnackbar('Please enter your business name', 'error');
                    return false;
                }
                if (!formData.email.trim()) {
                    showSnackbar('Please enter your email', 'error');
                    return false;
                }
                if (!formData.password.trim()) {
                    showSnackbar('Please enter a password', 'error');
                    return false;
                }
                if (!formData.contact.trim()) {
                    showSnackbar('Please enter your contact number', 'error');
                    return false;
                }
                if (!formData.address.trim()) {
                    showSnackbar('Please enter your address', 'error');
                    return false;
                }
                return true;

            case 2:
                if (!formData.aadharNumber.trim()) {
                    showSnackbar('Please enter your Aadhar number', 'error');
                    return false;
                }
                if (!files.aadharPhoto) {
                    showSnackbar('Please upload your Aadhar card photo', 'error');
                    return false;
                }
                if (!formData.panNumber.trim()) {
                    showSnackbar('Please enter your PAN number', 'error');
                    return false;
                }
                if (!files.panPhoto) {
                    showSnackbar('Please upload your PAN card photo', 'error');
                    return false;
                }
                if (!formData.gstNumber.trim()) {
                    showSnackbar('Please enter your GST number', 'error');
                    return false;
                }
                if (!files.gstDocument) {
                    showSnackbar('Please upload your GST document', 'error');
                    return false;
                }
                if (!formData.fssaiNumber.trim()) {
                    showSnackbar('Please enter your FSSAI number', 'error');
                    return false;
                }
                if (!files.fssaiDocument) {
                    showSnackbar('Please upload your FSSAI document', 'error');
                    return false;
                }
                return true;

            case 3:
                if (!formData.bankAccountNumber.trim()) {
                    showSnackbar('Please enter your bank account number', 'error');
                    return false;
                }
                if (!formData.ifscCode.trim()) {
                    showSnackbar('Please enter your IFSC code', 'error');
                    return false;
                }
                return true;

            default:
                return false;
        }
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
            showSnackbar('Step completed successfully', 'success');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateStep(currentStep)) {
            return;
        }

        try {
            const formDataToSend = new FormData();
            
            // Append all text fields
            Object.keys(formData).forEach(key => {
                formDataToSend.append(key, formData[key]);
            });

            // Append all files
            Object.keys(files).forEach(key => {
                if (files[key]) {
                    formDataToSend.append(key, files[key]);
                }
            });

            // Update the API endpoint to match the backend route
            await axiosInstance.post('/api/vendor/register', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            showSnackbar('Registration successful! Please wait for admin approval.', 'success');
            setTimeout(() => navigate('/'), 3000);
        } catch (error) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed';
            
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.status === 413) {
                errorMessage = 'File size too large. Please upload smaller files.';
            } else if (error.response?.status === 415) {
                errorMessage = 'Invalid file type. Please upload valid documents.';
            }
            
            showSnackbar(errorMessage, 'error');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="form-section">
                        <h3>Basic Information</h3>
                        <div className="form-group">
                            <label>Display Name</label>
                            <input
                                type="text"
                                name="displayName"
                                placeholder="Enter your business name"
                                value={formData.displayName}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Enter your email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="Create a password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Contact Number</label>
                            <input
                                type="tel"
                                name="contact"
                                placeholder="Enter your contact number"
                                value={formData.contact}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <textarea
                                name="address"
                                placeholder="Enter your complete address"
                                value={formData.address}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="form-section">
                        <h3>Document Information</h3>
                        <div className="form-group">
                            <label>Aadhar Number</label>
                            <input
                                type="text"
                                name="aadharNumber"
                                placeholder="Enter your Aadhar number"
                                value={formData.aadharNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group file-group">
                            <label>Aadhar Card Photo</label>
                            <input
                                type="file"
                                name="aadharPhoto"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>PAN Number</label>
                            <input
                                type="text"
                                name="panNumber"
                                placeholder="Enter your PAN number"
                                value={formData.panNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group file-group">
                            <label>PAN Card Photo</label>
                            <input
                                type="file"
                                name="panPhoto"
                                onChange={handleFileChange}
                                accept="image/*"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>GST Number</label>
                            <input
                                type="text"
                                name="gstNumber"
                                placeholder="Enter your GST number"
                                value={formData.gstNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group file-group">
                            <label>GST Document</label>
                            <input
                                type="file"
                                name="gstDocument"
                                onChange={handleFileChange}
                                accept=".pdf,image/*"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>FSSAI Number</label>
                            <input
                                type="text"
                                name="fssaiNumber"
                                placeholder="Enter your FSSAI number"
                                value={formData.fssaiNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group file-group">
                            <label>FSSAI Document</label>
                            <input
                                type="file"
                                name="fssaiDocument"
                                onChange={handleFileChange}
                                accept=".pdf,image/*"
                                required
                            />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="form-section">
                        <h3>Bank Details</h3>
                        <div className="form-group">
                            <label>Bank Account Number</label>
                            <input
                                type="text"
                                name="bankAccountNumber"
                                placeholder="Enter your bank account number"
                                value={formData.bankAccountNumber}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>IFSC Code</label>
                            <input
                                type="text"
                                name="ifscCode"
                                placeholder="Enter bank IFSC code"
                                value={formData.ifscCode}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="vendor-registration">
            <h2>Vendor Registration</h2>
            
            <div className="steps-indicator">
                {steps.map((step) => (
                    <div 
                        key={step.number} 
                        className={`step-item ${currentStep === step.number ? 'active' : ''} 
                                  ${currentStep > step.number ? 'completed' : ''}`}
                    >
                        <div className="step-number">{step.number}</div>
                        <div className="step-title">{step.title}</div>
                        {step.number < steps.length && <div className="step-connector" />}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit}>
                {renderStep()}
                <div className="form-buttons">
                    <button
                        type="button"
                        className="prev-btn"
                        disabled={currentStep === 1}
                        onClick={() => setCurrentStep(currentStep - 1)}
                    >
                        Previous
                    </button>
                    {currentStep < 3 ? (
                        <button
                            type="button"
                            className="next-btn"
                            onClick={handleNext}
                        >
                            Next
                        </button>
                    ) : (
                        <button type="submit" className="submit-btn">
                            Register
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

// Wrap the component with SnackbarProvider
const VendorRegistration = () => {
    return (
        <SnackbarProvider 
            maxSnack={3}
            dense
            preventDuplicate
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
        >
            <VendorRegistrationContainer />
        </SnackbarProvider>
    );
};

export default VendorRegistration; 