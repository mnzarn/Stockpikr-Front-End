import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, CircularProgress, ClickAwayListener, InputAdornment, TextField } from '@mui/material';
import React, { useRef, useState } from 'react';
import { getErrorResponse } from '../../helper/errorResponse';
import { IStockQuote } from '../../interfaces/IStockQuote';
import { StockApiService } from '../../services/StockApiService';

interface WatchlistSearchBarProps {
  setAddStockSymbol: (symbol: string) => void;
  onSelectStock?: () => void; // Added this prop to match expected interface
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
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnChangeTextField = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputSearch(value);

    if (value.trim().length === 0) {
      setSearchOptions([]);
      return;
    }

    // debounce search - use shorter delay
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      fetchData(value);
    }, 300); // Reduced debounce time for faster response
  };

  const handleClose = () => {
    setSearchOptions([]);
  };

  const fetchData = async (value: string): Promise<void> => {
    try {
      const response = await StockApiService.fetchDetailedStockSearch(value);

      if (!response || getErrorResponse(response)) {
        setSearchOptions([]);
      } else {
        setSearchOptions(response);
      }
    } catch (err) {
      setSearchOptions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOnSearchOptionChange = (e: React.SyntheticEvent<Element, Event>, value: IStockQuote | null) => {
    if (!value) return;

    setAddStockSymbol(value.symbol);
    setInputSearch('');

    if (onSelectStock) {
      onSelectStock(); // Call the callback if provided
    }
  };

  const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && searchOptions.length > 0) {
      const matchingStock =
        searchOptions.find((option) => option.symbol.toLowerCase() === inputSearch.toLowerCase()) || searchOptions[0];

      setAddStockSymbol(matchingStock.symbol);
      setInputSearch('');

      if (onSelectStock) {
        onSelectStock(); // Call the callback if provided
      }
    }
  };

  const filterOptions = (options: IStockQuote[], { inputValue }: { inputValue: string }) => {
    if (options.length === 0) return options;

    const inputLower = inputValue.toLowerCase();
    return options.filter(
      (stock) => stock.name.toLowerCase().includes(inputLower) || stock.symbol.toLowerCase().includes(inputLower)
    );
  };

  return (
    <div style={{ margin: '0 auto' }}>
      <ClickAwayListener onClickAway={handleClose}>
        <Autocomplete
          options={searchOptions}
          onChange={handleOnSearchOptionChange}
          getOptionLabel={(option) => option.symbol}
          filterOptions={filterOptions}
          loading={loading}
          disabled={isDisabled}
          value={null}
          inputValue={inputSearch}
          noOptionsText={loading ? 'Loading...' : 'Start typing to search for stocks'}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={isDisabled ? 'Select a watchlist first' : 'Search stock...'}
              onKeyDown={handleEnterPress}
              onChange={handleOnChangeTextField}
              size="small"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <>
                    {loading ? <CircularProgress color="inherit" size={16} /> : null}
                    {params.InputProps.endAdornment}
                  </>
                )
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props} style={{ padding: '4px 8px', display: 'flex', alignItems: 'center' }}>
              <strong style={{ width: '80px', textAlign: 'left' }}>{option.symbol}</strong>
              <span
                style={{
                  flex: 1,
                  marginLeft: '10px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {option.name}
              </span>
              <em style={{ width: '100px', textAlign: 'right', fontSize: '12px' }}>{option.exchange}</em>
            </li>
          )}
          sx={{
            width: { xs: '100%', sm: '250px', md: '300px' },
            '& .MuiAutocomplete-inputRoot': {
              height: '36px',
              padding: '2px 8px !important',
              fontSize: '0.9rem',
              backgroundColor: isDisabled ? 'rgba(0, 0, 0, 0.04)' : 'white'
            },
            '& .MuiAutocomplete-option': {
              padding: '2px 6px'
            }
          }}
        />
      </ClickAwayListener>
    </div>
  );
};

export default WatchlistTickersSearchBar;
