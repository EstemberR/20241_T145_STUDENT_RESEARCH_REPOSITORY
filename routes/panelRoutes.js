app.get('/panel/submissions', (req, res) =>{
    //logic to show the student research submission 
  });
  
  //view specific department
  app.get('/panel/:departmentId', (req, res) =>{
    //logic to show specific department
  });
  
  //View the specific student research submission
  app.get('/panel/submissions/:researchId', (req, res) => {
    //logic for viewing the specific student research
  });
  
  //view the approved student research
  app.get('/panel/submissions/:researchId/approved', (req, res) => {
    //logic for viewing the approved research 
  });
  
  //Reject research submission
  app.put('/panel/submissions/:researchId/reject', (req, res) => {
    //logic to reject student submission
  });
  
  //Provide feedback information
  app.post('/panel/submissions/:researchId/feedback', (req, res) => {
    //provide feedback on the research submission
  });
  
  //View feedback information
  app.get('/panel/submissions/:researchId/feedback', (req, res) => {
    //Logic to view the all the feedbacks for a research submission
  });
  
  //-----PROFILE-----
  //view the user's profile information
  app.get('/panel/profile', (req, res) => {
  });
  
  //edit the user's profile information
  app.put('/panel/profile', (req, res) => {
  });
  
  //add or change the user's profile picture
  app.put('/instructor/profile/picture', (req, res) => {
  });
  