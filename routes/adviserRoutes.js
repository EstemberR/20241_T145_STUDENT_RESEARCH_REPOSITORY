
//view of student research submission 
app.get('/adviser/assigned', (req, res) =>{
    //logic to show the student research submission 
  });
  
  //View the specific student research submission
  app.get('/adviser/assigned/:researchId', (req, res) => {
    //logic for viewing the specific student research
  });
  
  //view the approved student research
  app.get('/adviser/assigned/:researchId/approved', (req, res) => {
    //logic for viewing the approved research 
  });
  
  //Reject research submission
  app.put('/adviser/assigned/:researchId/reject', (req, res) => {
    //logic to reject student submission
  });
  
  //Provide feedback information
  app.post('/adviser/assigned/:researchId/feedback', (req, res) => {
    //provide feedback on the research submission
  });
  
  //View feedback information
  app.get('/adviser/assigned/:researchId/feedback', (req, res) => {
    //Logic to view the all the feedbacks for a research submission
  });
  
  //-----PROFILE-----
  //view the user's profile information
  app.get('/adviser/profile', (req, res) => {
  });
  
  //edit the user's profile information
  app.put('/adviser/profile', (req, res) => {
  });
  
  //add or change the user's profile picture
  app.put('/adviser/profile/picture', (req, res) => {
  });
  
  