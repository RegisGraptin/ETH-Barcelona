import React, { useState } from 'react';
import styles from "../styles/Home.module.css";

import axios from 'axios';

import { MuiFileInput } from 'mui-file-input'

const TwoFilesUpload = ({ resultFunction, user_address }) => {

    const [smartContractFile, setSmartContractFile] = useState("");
    const [auditFile, setAuditFile] = useState(null);

    const [error, guardarError] = useState(false);


    const submitForm = e => {

        // Prevent redirection
        e.preventDefault();
        
        // Create the form
        const formData = new FormData();
        formData.append("user_address", user_address);
        formData.append("contract", smartContractFile);
        formData.append("audit", auditFile);

        axios
            .post(
                "http://localhost:8000/audit/upload/files",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })

            .then((res) => {
                alert("File Upload success");
                console.log(res);
                resultFunction(true)
            })
            .catch((err) => {
                console.log(err);
                resultFunction(false)
            });
    };

    return (
        <div className="bg-info">
            {error ? <p className={styles.grid}>There is no contract's file or file to audit</p> : null}
            <div className="container">
                <div className="row">

                    <form
                        onSubmit={submitForm}
                        className="col card text-white bg-transparent mb-5 pt-5 pb-2"
                    >
                        <fieldset>
                            <legend className="text-center">Smart Contract Auditor
                            </legend>

                            <div className="row">
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <h2>Upload the vulnerable smartcontract</h2>
                                        <MuiFileInput 
                                            value={smartContractFile} 
                                            onChange={(newFile) => setSmartContractFile(newFile)}
                                        />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-group">
                                        <h2>Upload the audit</h2>
                                        <MuiFileInput 
                                            value={auditFile} 
                                            onChange={(newFile) => setAuditFile(newFile)}
                                        />
                                    </div>
                                </div>

                            </div>
                            <div className={styles.grid}>
                                <button
                                    type="submit"
                                    className={styles.grid}> Contribute
                                </button>
                            </div>

                        </fieldset>


                    </form>
                </div>
            </div>

        </div>
    );
}

export default TwoFilesUpload;