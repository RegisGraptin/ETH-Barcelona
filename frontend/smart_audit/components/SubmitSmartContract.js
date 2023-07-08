
// Function to make the POST request
const postData = async () => {
    try {
    //  setResultado({})
      console.log('within the request')
  
      const response = await axios.get('http://localhost:8000/dummy_output');/*, {
        // Request body data
        user_address: '0x30c96825922151a293175993B74216D9FacDb668',
        contract_address: '0xBB9bc244D798123fDe783fCc1C72d3Bb8C189413',
        audit:data */         

      console.log(response); // Response data from the server
     setResultado(response.data);
      const result = true;
    } catch (error) {
      console.error(error); // Handle error
    }
  };

  // Call the function to make the POST request
  postData();

}, [data,data]);

//  console.log(`there is response: ${response}`)

