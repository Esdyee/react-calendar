import React, { FC } from "react"; // React 및 Functional Component 타입 import
import { IMonthDay, TMonth } from "types/date"; // 날짜 관련 타입 import
import { IEvent } from "types/event"; // 이벤트 관련 타입 import
import { checkDateIsEqual } from "utils/date"; // 날짜 비교 유틸리티 함수 import
import { getPositionYForWeekEvents, getSortedEvents, getSortedWeekEvents } from "utils/helpers"; // 이벤트 관련 유틸리티 함수 import
import Day from "../day/Day"; // Day 컴포넌트 import
import styles from './week.module.scss'; // 스타일 모듈 import

interface IWeekProps { // Week 컴포넌트의 props 타입 정의
  weekDays: IMonthDay[];
  shortEvents: IEvent[];
  longEvents: IEvent[];
  selectedMonth: TMonth;
  countRows: number;
}

const Week: FC<IWeekProps> = ({ // Week 컴포넌트 정의
  weekDays,
  shortEvents,
  longEvents,
  selectedMonth,
  countRows
}) => {
  const { sortedWeekEvents } = getSortedWeekEvents(weekDays, longEvents); // 장기 이벤트 정렬
  console.log('Week.tsx', longEvents);
  
  const { sortedWeekEvents: weekShortEvents } = getSortedWeekEvents(weekDays, shortEvents); // 단기 이벤트 정렬

  const weekEventsPositionY = getPositionYForWeekEvents(sortedWeekEvents); // 이벤트의 Y 위치 계산

  return ( // 주별 날짜 렌더링
    <div className={styles.calendar__week}>
      {weekDays.map((day, indx) => {
        const startDateOfDay = day.date;

        const dayShortEvents = shortEvents.filter((event) => { // 해당 날짜의 단기 이벤트 필터링
          const startDateEvent = new Date(event.start);
          return checkDateIsEqual(startDateEvent, startDateOfDay);
        });

        const sortedDayShortEvents = getSortedEvents(dayShortEvents); // 단기 이벤트 정렬

        return ( // Day 컴포넌트 렌더링
          <Day
            key={`${day.monthIndex}-${day.dayNumber}`} // 각 Day 컴포넌트의 고유 키
            day={day} // 현재 날짜 정보
            selectedMonth={selectedMonth} // 선택된 월 정보
            dayShortEvents={sortedDayShortEvents} // 정렬된 단기 이벤트 목록
            dayLongEvents={sortedWeekEvents[indx]} // 해당 일자의 정렬된 장기 이벤트
            dayEventsPositionY={weekEventsPositionY[indx]} // 일자별 이벤트의 Y 위치
            weekEventsPositionY={weekEventsPositionY} // 주별 이벤트의 Y 위치
            weekShortEvents={weekShortEvents} // 주별 정렬된 단기 이벤트 목록
            countRows={countRows} // 주의 수
            weekDays={weekDays} // 주의 날짜 배열
            dayOfWeek={indx} // 주 내의 일자 인덱스
          />
        );
      })}
    </div>
  );
}

export default Week; // Week 컴포넌트 export
