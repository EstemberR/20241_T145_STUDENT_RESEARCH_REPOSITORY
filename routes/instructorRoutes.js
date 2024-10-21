
//view of student research submission 
app.get('/instructor/submissions', (req, res) =>{
    //logic to show the student research submission 
  });
  
  //view the specific submission
  app.get('/instructor/submissions/researchId', (req, res) =>{
    //logic to show the specific student research submission 
  });
  
  //provide feedback or suggestions to the research submission
  app.get('/instructor/submissions/:researchId/feedback', (req, res) => {
    //Logic to provide feedbacks for a research submission
  });
  
  //View feedback information
  app.get('/instructor/submissions/:researchId/feedback', (req, res) => {
    //Logic to view the all the feedbacks for a research submission
  });
  
  //Reject research submission
  app.put('/instructor/submissions/:researchId/reject', (req, res) => {
    //logic to reject student submission
  });
  
  //View approved research submission
  app.get('/instructor/submissions/:researchId/approved', (req, res) => {
    //logic to view approved student submission
  });
  
  //-----PROFILE-----
  //view the user's profile information
  app.get('/instructor/profile', (req, res) => {
  });
  
  //edit the user's profile information
  app.put('/instructor/profile', (req, res) => {
  });
  
  //add or change the user's profile picture
  app.put('/instructor/profile/picture', (req, res) => {
  });
  