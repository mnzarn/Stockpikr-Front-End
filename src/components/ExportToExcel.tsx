import IconButton from '@mui/material/IconButton';
import React from 'react';
import exportToExcel from '../helper/exportXslsHelper';

interface ExportToExcelButtonProps {
  data: unknown[];
  title: string;
}

const ExportToExcelButton: React.FC<ExportToExcelButtonProps> = ({ data, title }) => {
  return (
    <IconButton
      aria-label="export"
      onClick={() => exportToExcel(data, title)}
      sx={{ marginBottom: '20px', marginLeft: '10px' }}
    >
      <svg xmlns="http://www.w3.org/2000/svg" height={'20px'} width={'20px'} viewBox="0 0 384 512" fill="#197343">
        <path d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM155.7 250.2L192 302.1l36.3-51.9c7.6-10.9 22.6-13.5 33.4-5.9s13.5 22.6 5.9 33.4L221.3 344l46.4 66.2c7.6 10.9 5 25.8-5.9 33.4s-25.8 5-33.4-5.9L192 385.8l-36.3 51.9c-7.6 10.9-22.6 13.5-33.4 5.9s-13.5-22.6-5.9-33.4L162.7 344l-46.4-66.2c-7.6-10.9-5-25.8 5.9-33.4s25.8-5 33.4 5.9z" />
      </svg>
    </IconButton>
  );
};

export default ExportToExcelButton;
