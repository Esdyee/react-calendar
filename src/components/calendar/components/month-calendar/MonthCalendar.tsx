import { useTypedSelector } from 'hooks/index'; // Redux 스토어에서 타입이 지정된 상태를 선택하는 훅
import { useThrottle } from 'hooks/useThrottle'; // 이벤트 핸들러를 지연시키는 훅
import React, { FC, WheelEvent } from 'react';
import { IDirections, IMonthDay, IWeekDay, TMonth } from 'types/date'; // 날짜 관련 타입 정의
import { getEventsInterval, getLongEvents, getShortEvents } from 'utils/helpers'; // 이벤트 처리 유틸리티 함수
import Month from './components/month/Month'; // 월별 이벤트를 표시하는 컴포넌트
import Navigation from './components/navigation/Navigation'; // 달력 네비게이션 컴포넌트

import styles from './month-calendar.module.scss'; // 스타일 모듈

interface IMonthCalendarProps {
  weekDaysNames: IWeekDay[];
  calendarDaysOfMonth: IMonthDay[];
  selectedMonth: TMonth;
  onClickArrow: (direction: IDirections) => void;
}

const MonthCalendar: FC<IMonthCalendarProps> = ({
  weekDaysNames,
  calendarDaysOfMonth,
  selectedMonth,
  onClickArrow
}) => {
  const { events } = useTypedSelector(({ events }) => events); // Redux 스토어에서 이벤트 데이터를 선택

  const monthEvents = getEventsInterval(calendarDaysOfMonth, events); // 선택된 월에 해당하는 이벤트를 필터링
  const shortEvents = getShortEvents(monthEvents); // 단기 이벤트를 추출
  const longEvents = getLongEvents(monthEvents); // 장기 이벤트를 추출
  
  const changeMonth = useThrottle((e: WheelEvent<HTMLElement>) => { // 마우스 휠 이벤트로 월 변경 처리
      const { deltaY } = e;
      const direction = deltaY > 0 ? 'right' : 'left'; // 휠 방향에 따라 월 변경 방향 결정
      onClickArrow(direction);
  }, 300); // 300ms 지연
  
  return (
    <div
      className={styles.calendar__container} 
      onWheel={changeMonth} // 마우스 휠 이벤트 핸들러 연결
    >
      {/* 네비게이션 컴포넌트 렌더링 */}
      <Navigation weekDaysNames={weekDaysNames} /> 
      <div className="calendar__body">
        <div className={styles.calendar__content}>
          {/* 월 컴포넌트 렌더링 */}
          <Month
            calendarDaysOfMonth={calendarDaysOfMonth}
            selectedMonth={selectedMonth}
            shortEvents={shortEvents}
            longEvents={longEvents}
          />
        </div>
      </div>
    </div>
  );
}

export default MonthCalendar;
