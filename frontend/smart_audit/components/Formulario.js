import React, { useState} from 'react';
import styles from "../styles/Home.module.css";


const Formulario = ({inputAI}) => {

    const [busqueda, input] = useState({
        SChash: '',
        file: null
    });

    const [error, guardarError] = useState(false);

    
    const {SChash, file} = busqueda;
/*
        // Event handler for file input change
        const handleFileInputChange = (event) => {
            const file = event.target.files[0];
            
            console.log(file)   
            };
    */
    //funcion a cada input para leer su contenido
    const actualizarState = e => {
        
        input({
            ...busqueda,
            [e.target.name] : e.target.value
        })
    }

    
    //API Request
    const request = e => {
        e.preventDefault();

        if (SChash.trim() ==='') {
            guardarError(true);
            return;
        }
        guardarError(false);
        //Todo bien, pasar al componente principal

        console.log(file)
        console.log('requesting...')


        inputAI(busqueda);


    }
    return ( 
            <div className="bg-info">
                {error ? <p className={styles.grid}>There is no hash or file to audit</p> : null}
                <div className="container">
                    <div className="row">
                            
                                <form
                                        onSubmit={request}
                                        className="col card text-white bg-transparent mb-5 pt-5 pb-2"
                                >
                                    <fieldset>
                                                <legend className="text-center">Smart Contract Auditor
                                                </legend>

                                                <div className="row">
                                                            <div className="col-md-6">
                                                                <div className="form-group">
                                                                    <label>Smart Contract Hash </label>
                                                                            <input 
                                                                            type="text"
                                                                            className="form-control"
                                                                            name="SChash"
                                                                            placeholder="0X24567..."
                                                                            onChange={actualizarState}
                                                                            value={SChash}
                                                                            />
                                                                </div>
                                                            </div>
                                                            <div className="col-md-6">
                                                                     <div className="form-group">
                                                                            <label>Upload a file </label>
                                                                            <input type="file"
                                                                            onChange={actualizarState}
                                                                            name="file"
                                                                            //value={file}
                                                                             />
                                                                        </div>                                                     
                                                            </div>
                                                   
                                                </div>
                                                    <div className={styles.grid}>
                                                    <button
                                                        type="submit"
                                                        className={styles.grid}> Audit
                                                    </button>
                                                </div>
                                               
                                    </fieldset>


                                </form>
                    </div>
                </div>

            </div>
     );
}
 
export default Formulario;