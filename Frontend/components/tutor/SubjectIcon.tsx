import React from 'react';
import { 
  BookOpen, Calculator, Globe, TestTube, Code, Music, 
  Heart, Users, Timer, Palette, Database, BrainCircuit
} from 'lucide-react';

interface SubjectIconProps {
  subject: string;
  size?: number;
  className?: string;
}

export function SubjectIcon({ subject, size = 24, className = '' }: SubjectIconProps) {
  const subjectLower = subject.toLowerCase();
  
  let Icon = BookOpen; // Default icon
  
  if (subjectLower.includes('math')) {
    Icon = Calculator;
  } else if (subjectLower.includes('science') || subjectLower.includes('physics') || subjectLower.includes('chemistry')) {
    Icon = TestTube;
  } else if (subjectLower.includes('computer') || subjectLower.includes('coding')) {
    Icon = Code;
  } else if (subjectLower.includes('geography') || subjectLower.includes('earth')) {
    Icon = Globe;
  } else if (subjectLower.includes('music')) {
    Icon = Music;
  } else if (subjectLower.includes('health')) {
    Icon = Heart;
  } else if (subjectLower.includes('social') || subjectLower.includes('history')) {
    Icon = Users;
  } else if (subjectLower.includes('art')) {
    Icon = Palette;
  } else if (subjectLower.includes('history')) {
    Icon = Timer;
  } else if (subjectLower.includes('data')) {
    Icon = Database;
  } else if (subjectLower.includes('ai') || subjectLower.includes('machine')) {
    Icon = BrainCircuit;
  }
  
  return <Icon size={size} className={className} />;
}