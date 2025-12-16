// src/components/ProjectCard.js
import React from 'react';
import '../Styles.css'; // Create this CSS file

function ProjectCard() {
  const projects = [
    { name: 'Material UI XD Version', members: '4', budget: '$14,000', completion: '60%' },
    { name: 'Add New Products', members: '2', budget: '$3,000', completion: '10%' },
    { name: 'Fix Platform Errors', members: '1', budget: 'Not set', completion: '100%' },
  ];

  return (
    <div className="project-card">
      {/* <div className="card-header">
        <h3>Projects</h3>
        <p>30 done this month</p>
      </div> */}
      {/* <div className="card-body"> */}
        {/* <table>
          <thead>
            <tr>
              <th>COMPANIES</th>
              <th>MEMBERS</th>
              <th>BUDGET</th>
              <th>COMPLETION</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project, index) => (
              <tr key={index}>
                <td>{project.name}</td> */}
                {/* <td>{project.members}</td> You'd render member avatars/images here
                <td>{project.budget}</td>
                <td> */}
                  {/* <div className="completion-bar-container">
                    <div className="completion-bar" style={{ width: project.completion }}></div>
                  </div> */}
                  {/* <span>{project.completion}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table> */}
      {/* </div> */}
    </div>
  );
}

export default ProjectCard;