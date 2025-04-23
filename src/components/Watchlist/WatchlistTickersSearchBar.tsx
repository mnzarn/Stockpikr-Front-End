import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  Box,
  CircularProgress,
  ClickAwayListener,
  InputAdornment,
  Paper,
  TextField,
  Typography
} from '@mui/material';
import React, { useRef, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { StockApiService } from '../../services/StockApiService';

interface WatchlistSearchBarProps {
  setAddStockSymbol: (symbol: string) => void;
  onSelectStock?: () => void;
  isDisabled?: boolean;
}

const WatchlistTickersSearchBar: React.FC<WatchlistSearchBarProps> = ({
  setAddStockSymbol,
  onSelectStock,
  isDisabled = false
}) => {
  const [searchOptions, setSearchOptions] = useState<IStockQuote[]>([]);
  const [inputSearch, setInputSearch] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Add a ref to track if the component has been interacted with
  const hasInteractedRef = useRef<boolean>(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSearch(value);
    setError(null);
    // Mark as interacted whenever user types
    hasInteractedRef.current = true;

    if (value.trim().length === 0) {
      setSearchOptions([]);
      return;
    }

    // debounce search
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      fetchData(value);
    }, 600);
  };

  const handleClose = () => {
    setSearchOptions([]);
    setInputSearch(''); // Clear the input text when clicking away
  };

  const fetchData = async (value: string): Promise<void> => {
    try {
      const response = await StockApiService.fetchDetailedStockSearch(value);
      setLoading(false);

      if (!response || getErrorResponse(response)) {
        setError('No results found');
        setSearchOptions([]);
        return;
      }

      setSearchOptions(response);

      if (response.length === 0) {
        setError('No results found');
      }
    } catch (err) {
      setLoading(false);
      setError('Error searching for stocks');
      setSearchOptions([]);
    }
  };

  const handleOnSearchOptionChange = (e: React.SyntheticEvent<Element, Event>, value: IStockQuote | null) => {
    // Mark as interacted whenever a selection is made
    hasInteractedRef.current = true;
    
    if (!value) {
      return;
    }
    
    // Set the symbol first
    setAddStockSymbol(value.symbol);
    
    // Clear input immediately
    setInputSearch('');
    
    // Clear search options to close dropdown
    setSearchOptions([]);

    // Slight delay to ensure the symbol is set before triggering the callback
    if (onSelectStock) {
      setTimeout(() => onSelectStock(), 50);
    }
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // Mark as interacted on Enter key
      hasInteractedRef.current = true;

      // If we have search results, use the first one
      if (searchOptions.length > 0) {
        const matchingStock =
          searchOptions.find((option) => option.symbol.toLowerCase() === inputSearch.toLowerCase()) || searchOptions[0]; // Use exact match if found, otherwise first result

        // Set the symbol first
        setAddStockSymbol(matchingStock.symbol);
        
        // Clear input and search options
        setInputSearch('');
        setSearchOptions([]);

        // Ensure the callback is called after state updates
        if (onSelectStock) {
          setTimeout(() => onSelectStock(), 50);
        }
      }
    }
  };

  const filterOptions = (options: IStockQuote[], { inputValue }: { inputValue: string }) => {
    if (options.length === 0) {
      return options;
    }

    const inputLower = inputValue.toLowerCase();

    // First try to find exact matches for symbol
    const exactSymbolMatches = options.filter((stock) => stock.symbol.toLowerCase() === inputLower);

    // If we have exact matches, prioritize them
    if (exactSymbolMatches.length > 0) {
      return exactSymbolMatches;
    }

    // Otherwise return all partial matches
    return options.filter(
      (stock) => stock.name.toLowerCase().includes(inputLower) || stock.symbol.toLowerCase().includes(inputLower)
    );
  };

  // Handle clicks on options directly
  const handleOptionClick = (option: IStockQuote) => {
    hasInteractedRef.current = true;
    setAddStockSymbol(option.symbol);
    setInputSearch('');
    setSearchOptions([]);
    
    if (onSelectStock) {
      setTimeout(() => onSelectStock(), 50);
    }
  };

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Autocomplete
        options={searchOptions}
        onChange={handleOnSearchOptionChange}
        getOptionLabel={(option) => option.symbol}
        filterOptions={filterOptions}
        loading={loading}
        open={searchOptions.length > 0}
        disabled={isDisabled}
        value={null} // Always reset the value to ensure the input is cleared
        inputValue={inputSearch}
        fullWidth
        size="small"
        PaperComponent={(props) => (
          <Paper
            {...props}
            elevation={3}
            sx={{
              borderRadius: '8px',
              mt: 1,
              border: '1px solid var(--border-color)'
            }}
          />
        )}
        noOptionsText={error || 'Start typing to search for stocks'}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={isDisabled ? 'Select a watchlist first' : 'Search stock...'}
            onKeyDown={handleEnterPress}
            onChange={handleOnChangeTextField}
            inputProps={{
              ...params.inputProps,
              style: { textAlign: 'left' }
            }}
            variant="outlined"
            size="small"
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'var(--secondary-blue)', fontSize: '1.2rem' }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
              sx: {
                borderRadius: '20px',
                height: '38px',
                backgroundColor: isDisabled ? 'rgba(0, 0, 0, 0.04)' : 'white',
                border: `1px solid var(--border-color)`,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: isDisabled ? 'rgba(0, 0, 0, 0.23)' : 'var(--primary-blue)'
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'var(--primary-blue)'
                },
                '& input': {
                  textAlign: 'left',
                  paddingLeft: '8px',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-family)'
                },
                justifyContent: 'flex-start'
              }
            }}
            sx={{
              width: '300px',
              flexShrink: 0, // Prevent the search bar from shrinking
              marginLeft: 0, // Ensure no left margin
              '& .MuiOutlinedInput-root': {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                '& fieldset': {
                  borderRadius: '20px',
                  borderColor: 'var(--border-color)'
                }
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <li
            {...props}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 16px'
            }}
            onClick={(e) => {
              props.onClick?.(e);
              handleOptionClick(option);
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography
                  sx={{
                    fontWeight: 600,
                    color: 'var(--primary-blue)',
                    fontFamily: 'var(--font-family)'
                  }}
                >
                  {option.symbol}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'var(--secondary-blue)',
                    fontFamily: 'var(--font-family)',
                    fontSize: '0.75rem'
                  }}
                >
                  {option.exchange}
                </Typography>
              </Box>

              <Typography
                variant="body2"
                sx={{
                  color: 'var(--secondary-blue)',
                  fontFamily: 'var(--font-family)',
                  fontSize: '0.8rem',
                  mt: 0.5
                }}
              >
                {option.name}
              </Typography>
            </Box>
          </li>
        )}
      />
    </ClickAwayListener>
  );
};

export default WatchlistTickersSearchBar;
