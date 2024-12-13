import express from 'express';
import Student from '../model/Student.js';
import Instructor from '../model/Instructor.js';
import Research from '../model/Research.js';
import authenticateToken from '../middleware/authenticateToken.js';

const router = express.Router();

// Dashboard stats
router.get('/dashboard-stats', authenticateToken, async (req, res) => {
  try {
    const [studentCount, instructorCount] = await Promise.all([
      Student.countDocuments(),
      Instructor.countDocuments()
    ]);

    res.json({
      success: true,
      data: {
        students: studentCount,
        instructors: instructorCount,
        activeUsers: studentCount + instructorCount,
        totalUsers: studentCount + instructorCount
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
});

// Research stats
router.get('/research-stats', authenticateToken, async (req, res) => {
  try {
    const [total, pending, approved, rejected] = await Promise.all([
      Research.countDocuments(),
      Research.countDocuments({ status: 'Pending' }),
      Research.countDocuments({ status: 'Approved' }),
      Research.countDocuments({ status: 'Rejected' })
    ]);

    res.json({
      success: true,
      total,
      pending,
      approved,
      rejected
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching research stats' });
  }
});

// User distribution
router.get('/user-distribution', authenticateToken, async (req, res) => {
  try {
    const [studentCount, instructorCount] = await Promise.all([
      Student.countDocuments(),
      Instructor.countDocuments()
    ]);

    const data = {
      labels: ['Students', 'Instructors'],
      datasets: [{
        data: [studentCount, instructorCount],
        backgroundColor: ['rgba(75, 192, 192, 0.8)', 'rgba(255, 99, 132, 0.8)'],
        borderColor: ['rgb(75, 192, 192)', 'rgb(255, 99, 132)'],
        borderWidth: 1
      }]
    };

    res.json({
      success: true,
      data
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching distribution' });
  }
});

// Submission trends
router.get('/submission-trends', authenticateToken, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);

    // Get all research submissions for the last 6 months
    const researches = await Research.find({
      createdAt: { $gte: sixMonthsAgo }
    }).select('createdAt status');

    // Process the data month by month
    const months = {};
    researches.forEach(research => {
      const monthKey = `${research.createdAt.getMonth() + 1}-${research.createdAt.getFullYear()}`;
      
      if (!months[monthKey]) {
        months[monthKey] = {
          month: `${getMonthName(research.createdAt.getMonth() + 1)} ${research.createdAt.getFullYear()}`,
          count: 0,
          pendingCount: 0,
          approvedCount: 0
        };
      }

      months[monthKey].count += 1;
      if (research.status === 'Pending') {
        months[monthKey].pendingCount += 1;
      }
      if (research.status === 'Approved' || research.status === 'Accepted') {
        months[monthKey].approvedCount += 1;
      }
    });

    // Convert to array and sort by date
    const formattedData = Object.values(months).sort((a, b) => {
      const [monthA, yearA] = a.month.split(' ');
      const [monthB, yearB] = b.month.split(' ');
      return new Date(`${monthA} 1, ${yearA}`) - new Date(`${monthB} 1, ${yearB}`);
    });

    console.log('Formatted trend data:', formattedData); // Debug log

    res.json({
      success: true,
      data: formattedData
    });

  } catch (error) {
    console.error('Error fetching submission trends:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission trends'
    });
  }
});

function getMonthName(monthNumber) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthNumber - 1];
}

export default router; 