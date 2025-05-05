import { ClickAwayListener, useMediaQuery, useTheme } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getErrorResponse } from '../helper/errorResponse';
import IStockData from '../interfaces/IStockData';
import { StockApiService } from '../services/StockApiService';
import { useAsyncError } from './GlobalErrorBoundary';

const SearchBar: React.FC = () => {
  const [searchOptions, setSearchOptions] = useState<IStockData[]>([]);
  const [inputSearch, setInputSearch] = useState<string>('');
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();
  const throwError = useAsyncError();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleOnChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSearch(value);
    if (value.trim().length === 0) {
      return;
    }

    // debounce
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      fetchData(value);
    }, 600);
  };

  const handleClose = () => {
    setSearchOptions([]);
  };

  const filterOptions = (options: IStockData[], { inputValue }: { inputValue: string }) => {
    if (options.length === 0) {
      return options;
    }
    const inputLower = inputValue.toLowerCase();
    const filterOptions = options.filter(
      (stock) => stock.name.toLowerCase().includes(inputLower) || stock.symbol.toLowerCase().includes(inputLower)
    );
    return filterOptions;
  };

  const handleOnChangeAutoComplete = (e: React.SyntheticEvent<Element, Event>, value: IStockData | null) => {
    if (!value) {
      return;
    }
    navigate('/quote?symbol=' + value.symbol);
  };

  const fetchData = async (value: string): Promise<void> => {
    StockApiService.fetchStockSearch(value)
      .then((response): void => {
        if (!response || getErrorResponse(response)) {
          return;
        }
        setSearchOptions(response);
      })
      .catch((error) => {
        throwError(error);
      });
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (searchOptions.find((options) => options.symbol.toLocaleLowerCase() === inputSearch.toLocaleLowerCase())) {
        navigate('/quote?symbol=' + inputSearch);
      } else {
        event.preventDefault(); // api does not accept stock name for quotes, so we force the user to select from the drop down if it does not match
      }
    }
  };

  return (
    <div style={{ margin: isMobile ? '10px 0' : '0 10px' }}>
      <ClickAwayListener onClickAway={handleClose}>
        <Autocomplete
          options={searchOptions}
          onChange={handleOnChangeAutoComplete}
          getOptionLabel={(option) => option.symbol}
          filterOptions={filterOptions}
          renderInput={(params) => (
            <TextField
              {...params}
              onKeyDown={handleEnterPress}
              placeholder="Search by symbol or name"
              size="small"
              onChange={handleOnChangeTextField}
              sx={{ 
                '& .MuiInputBase-root': {
                  height: '36px', // Compact height
                  fontSize: '0.9rem' // Slightly smaller font
                }
              }}
            />
          )}
          renderOption={(props, option) => (
            <li
              {...props}
              style={{
                display: 'flex',
                fontSize: '14px', // Smaller font
                alignItems: 'center',
                padding: '4px 8px' // Reduced padding
              }}
            >
              <strong style={{ width: '80px', textAlign: 'left' }}>{option.symbol}</strong>
              <span style={{ flex: 1, marginLeft: '10px', marginRight: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option.name}</span>
              <em style={{ width: '100px', textAlign: 'right', fontSize: '12px' }}>{option.stockExchange}</em>
            </li>
          )}
          sx={{
            backgroundColor: 'white',
            width: { xs: '100%', sm: '250px', md: '300px' }, // Slightly narrower
            borderRadius: 2,
            '& li': {
              width: 'auto'
            },
            '& .MuiAutocomplete-inputRoot': {
              padding: '2px 8px !important' // Reduced padding
            }
          }}
        />
      </ClickAwayListener>
    </div>
  );
};

export default SearchBar;
