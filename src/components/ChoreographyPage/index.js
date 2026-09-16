import React from 'react';
import './index.css';

const ChoreographyPage = () => {
  const choreographers = [
    { id: 1, name: 'ABC Choreo', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?w=400&h=400&fit=crop' },
    { id: 2, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1547153760-18fc9498041f?w=400&h=400&fit=crop' },
    { id: 3, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?w=400&h=400&fit=crop' },
    { id: 4, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop' },
    { id: 5, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop' },
    
    { id: 6, name: 'ABC Choreo', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=400&fit=crop' },
    { id: 7, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop' },
    { id: 8, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop' },
    { id: 9, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop' },
    { id: 10, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop' },
    
    { id: 11, name: 'ABC Choreo', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop' },
    { id: 12, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop' },
    { id: 13, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=400&h=400&fit=crop' },
    { id: 14, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&h=400&fit=crop' },
    { id: 15, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1504593811423-6dd665756598?w=400&h=400&fit=crop' },
    
    { id: 16, name: 'ABC Choreo', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=400&fit=crop' },
    { id: 17, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&h=400&fit=crop' },
    { id: 18, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop' },
    { id: 19, name: 'Jatin', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&h=400&fit=crop' },
    { id: 20, name: 'CJ Rohit', location: 'Hyderabad', image: 'https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=400&h=400&fit=crop' }
  ];

  return (
    <div className="choreography-page">
      <h1 className="choreography-title">Choreography</h1>
      
      <div className="choreography-grid">
        {choreographers.map((person) => (
          <div key={person.id} className="choreographer-card">
            <div className="choreographer-image-wrapper">
              <img src={person.image} alt={person.name} className="choreographer-image" />
            </div>
            <h3 className="choreographer-name">{person.name}</h3>
            <p className="choreographer-location">{person.location}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChoreographyPage;