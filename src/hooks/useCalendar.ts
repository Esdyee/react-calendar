import React from 'react';
import { IDirections, IModes } from 'types/date';

import {
  getMonthesNames,
  createMonth,
  getWeekDaysNames,
  createDate,
  createWeek,
  getCalendarDaysOfMonth,
  checkDateIsEqual,
  getCalendarDaysOfYear
} from 'utils/date';

interface UseCalendarParams {
  locale?: string;
  selectedDate: Date;
  firstWeekDayNumber?: number;
  defaultMode?: IModes;
}

const getYearsInterval = (year: number) => {
  const startYear = Math.floor(year / 10) * 10;
  return [...Array(10)].map((_, index) => startYear + index);
};

export const useCalendar = ({
  locale = 'default',
  selectedDate: date,
  firstWeekDayNumber = 2,
  defaultMode = 'week'
}: UseCalendarParams) => {
  const [mode, setMode] = React.useState<IModes>(defaultMode); // 상태: 현재 모드
  const [selectedDay, setSelectedDay] = React.useState(createDate({ date })); // 상태: 선택된 날짜
  const [selectedWeek, setSelectedWeek] = React.useState(createWeek({ date: selectedDay.date, locale })); // 상태: 선택된 주
  const [selectedMonth, setSelectedMonth] = React.useState(
    createMonth({ date: new Date(selectedDay.year, selectedDay.monthIndex), locale })
  ); // 상태: 선택된 월
  const [selectedYear, setSelectedYear] = React.useState(selectedDay.year); // 상태: 선택된 연도
  const [selectedYearsInterval, setSelectedYearsInterval] = React.useState(
    getYearsInterval(selectedDay.year)
  ); // 상태: 선택된 연도 구간

  const monthesNames = React.useMemo(() => getMonthesNames(selectedDay.date, locale), [selectedDay]); // 메모: 월 이름
  const weekDaysNames = React.useMemo(() => getWeekDaysNames(firstWeekDayNumber, locale), []); // 메모: 요일 이름
  const weekDays = React.useMemo(() => selectedWeek.createWeekDays(), [selectedWeek.dayNumber, selectedYear, selectedMonth.monthIndex]); // 메모: 주의 날짜들
  const displayedDate = React.useMemo(() => {
    if (mode === 'year') {
      return `${selectedYear}`;
    }
    if (mode === 'month') {
      return `${monthesNames[selectedMonth.monthIndex].month} ${selectedYear}`;
    }
    return selectedWeek.displayedMonth;
  }, [selectedYear, selectedMonth.monthIndex, selectedWeek.dayNumber, mode]); // 메모: 표시되는 날짜

  const calendarDaysOfMonth = React.useMemo(() => {
    return mode !== 'month'
      ? []
      : getCalendarDaysOfMonth({ year: selectedYear, monthIndex: selectedMonth.monthIndex, firstWeekDayNumber })
  }, [selectedYear, selectedMonth.monthIndex, mode]); // 메모: 월의 날짜들

  const calendarDaysOfYear = React.useMemo(() => {
    if (mode !== 'year') {
      return [];
    }

    return getCalendarDaysOfYear({ year: selectedYear, firstWeekDayNumber });
  }, [selectedYear, mode]); // 메모: 연의 날짜들

  const onChangeState = (date: Date) => {
    const { year, monthIndex } = createDate({ date });
    const isCurrentYear = year === selectedYear;
    const isCurrentMonth = monthIndex === selectedMonth.monthIndex;

    !isCurrentYear && setSelectedYear(year);
    !(isCurrentYear && isCurrentMonth) && setSelectedMonth(createMonth({ date, locale }));
    !checkDateIsEqual(date, selectedWeek.date) && setSelectedWeek(createWeek({ date, locale }));
    !checkDateIsEqual(date, selectedDay.date) && setSelectedDay(createDate({ date }));
  } // 함수: 상태 변경

  const onClickArrow = (direction: IDirections) => {
    if (direction === 'today') {
      return onChangeState(new Date());
    }

    if (mode === 'year') {
      const year = selectedYear + (direction === 'left' ? -1 : 1);
      return onChangeState(new Date(year, 0, 1));
    }

    if (mode === 'month') {
      const month = selectedMonth.monthIndex + (direction === 'left' ? -1 : 1);
      return onChangeState(new Date(selectedMonth.year, month, 1));
    }

    if (mode === 'week') {
      const dayNumber = selectedWeek.dayNumber + (direction === 'left' ? -7 : 7);
      const newSelectedWeekDate = new Date(selectedWeek.year, selectedWeek.monthIndex, dayNumber);
      onChangeState(newSelectedWeekDate);
    }

    if (mode === 'years') {
      const years = selectedYearsInterval[0] + (direction === 'left' ? -10 : 10); 
      return setSelectedYearsInterval(getYearsInterval(years));
    }

    if (mode === 'monthes') {
      const year = selectedYear + (direction === 'left' ? -1 : 1);
      if (!selectedYearsInterval.includes(year)) {
        setSelectedYearsInterval(getYearsInterval(year));
      }
      return setSelectedYear(year);
    }
  }; // 함수: 화살표 클릭 이벤트 처리
  
  const setSelectedMonthByIndex = (monthIndex: number) => {
    setSelectedMonth(createMonth({ date: new Date(selectedYear, monthIndex), locale }));
  }; // 함수: 월 선택

  return {
    state: {
      mode,
      calendarDaysOfMonth,
      calendarDaysOfYear,
      displayedDate,
      weekDaysNames,
      weekDays,
      monthesNames,
      selectedDay,
      selectedMonth,
      selectedYear,
      selectedYearsInterval
    },
    functions: {
      onClickArrow,
      setMode,
      setSelectedDay,
      setSelectedYear,
      onChangeState,
      setSelectedMonthByIndex,
      setSelectedYearsInterval
    }
  };
};
