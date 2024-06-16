import React, { FC } from 'react';
import { useCalendar } from 'hooks/useCalendar';
import WeekCalendar from './components/week-calendar/WeekCalendar'; // 주간 달력을 표시하는 컴포넌
import Header from 'components/common/header/Header'; // 달력의 헤더 부분을 표시하는 컴포넌트
import YearCalendar from './components/year-calendar/YearCalendar'; // 연간 달력을 표시하는 컴포넌트
import MonthCalendar from './components/month-calendar/MonthCalendar'; // 월간 달력을 표시하는 컴포넌트

import './calendar.scss'; // 달력 관련 스타일

interface ICalendarProps {
}

const Calendar: FC<ICalendarProps> = ({  }) => {
  const { state, functions } = useCalendar({ selectedDate: new Date() }); // 달력의 상태와 함수를 관리하는 훅

  console.log(state);


  // 달력의 월별 날짜 데이터에 가상의 mock 데이터를 생성하여 삽입
  const mockCalendarDaysOfMonth = [
    { 
      year: state.selectedYear, 
      monthIndex: state.selectedMonth.monthIndex, 
      dayNumber: 1, 
      dayNumberInWeek: new Date(state.selectedYear, state.selectedMonth.monthIndex, 1).getDay(), 
      date: new Date(state.selectedYear, state.selectedMonth.monthIndex, 1),
      monthShort: '2024-06-16'
    },
    // { 
    //   year: state.selectedYear, 
    //   monthIndex: state.selectedMonth.monthIndex, 
    //   dayNumber: 2, 
    //   dayNumberInWeek: new Date(state.selectedYear, state.selectedMonth.monthIndex, 2).getDay(), 
    //   date: new Date(state.selectedYear, state.selectedMonth.monthIndex, 2),
    //   monthShort: '2024-06-17'
    // },
    // { 
    //   year: state.selectedYear, 
    //   monthIndex: state.selectedMonth.monthIndex, 
    //   dayNumber: 3, 
    //   dayNumberInWeek: new Date(state.selectedYear, state.selectedMonth.monthIndex, 3).getDay(), 
    //   date: new Date(state.selectedYear, state.selectedMonth.monthIndex, 3),
    //   monthShort: '2024-06-18'
    // },
    // 이하 생략, 실제 사용 시 모든 날짜를 포함해야 함
  ];

  // 실제 상태에 mock 데이터 적용
  // state.calendarDaysOfMonth = mockCalendarDaysOfMonth;


  return (
    <>
      <Header
        onClickArrow={functions.onClickArrow} // 화살표 클릭 이벤트 핸들러
        displayedDate={state.displayedDate} // 표시되는 날짜
        onChangeOption={functions.setMode} // 달력 모드 변경 함수
        selectedOption={state.mode} // 현재 선택된 달력 모드
        selectedDay={state.selectedDay} // 선택된 날짜
      />
      <section className="calendar">
        {state.mode === 'year' && (
          <YearCalendar
            selectedDay={state.selectedDay} // 선택된 날짜
            selectedMonth={state.selectedMonth} // 선택된 월
            monthesNames={state.monthesNames} // 월 이름 배열
            weekDaysNames={state.weekDaysNames} // 요일 이름 배열
            calendarDaysOfYear={state.calendarDaysOfYear} // 연간 달력의 날짜 데이터
            onChangeState={functions.onChangeState} // 상태 변경 함수
          />
        )}
        
        {state.mode === 'month' && (
          <MonthCalendar
            weekDaysNames={state.weekDaysNames} // 요일 이름 배열
            calendarDaysOfMonth={state.calendarDaysOfMonth} // 월간 달력의 날짜 데이터
            selectedMonth={state.selectedMonth} // 선택된 월
            onClickArrow={functions.onClickArrow} // 화살표 클릭 이벤트 핸들러
          />
        )}
        
        {state.mode === 'week' && (
          <WeekCalendar
            weekDays={state.weekDays} // 주간 달력의 날짜 데이터
            weekDaysNames={state.weekDaysNames} // 요일 이름 배열
          />
        )}
        
      </section>
    </>
  );
}

export default Calendar;
