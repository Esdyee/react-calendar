import React, { FC } from 'react'; // React와 FC(Functional Component) 타입을 가져옴
import { IMonthDay, TMonth } from 'types/date'; // 날짜 관련 타입 정의를 가져옴
import { IEvent } from 'types/event'; // 이벤트 관련 타입 정의를 가져옴
import Week from '../week/Week'; // 주 단위 컴포넌트를 가져옴

import styles from './month.module.scss'; // 스타일 모듈을 가져옴

// Month 컴포넌트의 props 타입 정의
interface IMonthProps {
  calendarDaysOfMonth: IMonthDay[]; // 월의 날짜 배열
  selectedMonth: TMonth; // 선택된 월
  shortEvents: IEvent[]; // 단기 이벤트 배열
  longEvents: IEvent[]; // 장기 이벤트 배열
}

// Month 컴포넌트 정의
const Month: FC<IMonthProps> = ({
  calendarDaysOfMonth,
  selectedMonth,
  shortEvents,
  longEvents
}) => {
  const countRows = (calendarDaysOfMonth.length / 7); // 주의 수 계산

  // 주 단위로 날짜 배열을 나눔
  const weeksDays = Array.from({ length: countRows })
    .map((_, i) => calendarDaysOfMonth.slice(i * 7, (i + 1) * 7))

  return (
    <div className={styles.calendar__month}>
      {weeksDays.map((weekDays, i) => {
        return (
          <Week
            key={i} // 각 주의 고유 키
            weekDays={weekDays} // 주의 날짜 배열
            selectedMonth={selectedMonth} // 선택된 월
            shortEvents={shortEvents} // 단기 이벤트 배열
            longEvents={longEvents} // 장기 이벤트 배열
            countRows={countRows} // 주의 수
          />
        );
      })}
    </div>
  );
}

export default Month; // Month 컴포넌트를 기본 내보내기로 설정
