import React, { FC, MouseEvent } from 'react'; // React 및 타입 import
import { IMonthDay, TMonth } from 'types/date'; // 날짜 타입 import
import { IEvent } from 'types/event'; // 이벤트 타입 import
import { checkIsToday, createDate, getNextStartMinutes, shmoment } from 'utils/date'; // 날짜 유틸리티 함수 import
import { useModal } from 'hooks/useModal'; // 모달 훅 import
import { checkIsEventsShowInCurrentInterval, getStyledForLongEvent } from 'utils/helpers'; // 헬퍼 함수 import
import cn from 'classnames'; // 클래스네임 유틸리티 import
import LongEvent from 'components/common/long-event/LongEvent'; // LongEvent 컴포넌트 import
import ShortEvent from 'components/common/short-event/ShortEvent'; // ShortEvent 컴포넌트 import

import styles from './day.module.scss'; // 스타일 import

interface IDayProps { // props 타입 정의
  weekDays: IMonthDay[];
  day: IMonthDay;
  selectedMonth: TMonth;
  dayShortEvents: IEvent[];
  dayLongEvents: IEvent[];
  dayEventsPositionY: string[];
  weekEventsPositionY: string[][];
  weekShortEvents: IEvent[][];
  countRows: number;
  dayOfWeek: number;
}

const Day: FC<IDayProps> = ({ // Day 컴포넌트 정의
  weekDays,
  day,
  selectedMonth,
  dayShortEvents,
  dayLongEvents,
  dayEventsPositionY,
  weekEventsPositionY,
  weekShortEvents,
  countRows,
  dayOfWeek
}) => {
  const { openModalCreate, openModalDayInfo } = useModal(); // 모달 훅 사용
  
  const maxCountEventsInDay = countRows === 6 ? 3 : 4; // 일 최대 이벤트 수 계산

  const restWeekEventsPositionY = weekEventsPositionY.slice(dayOfWeek + 1); // 나머지 주 이벤트 위치 계산

  const isShowMoreBtn = restWeekEventsPositionY.some((eventsPositionY, indx) => { // 더보기 버튼 표시 여부 계산
    const idsEventsOutBounds = dayEventsPositionY.slice(maxCountEventsInDay - 1);
    const isIdsEventsContaintsInDay = idsEventsOutBounds.some((idEvent) => eventsPositionY.includes(idEvent));
    
    const dayShortEvents = weekShortEvents[dayOfWeek + indx + 1];
    const countEventsInDay = dayShortEvents.length + eventsPositionY.length;
    
    return isIdsEventsContaintsInDay && (maxCountEventsInDay < countEventsInDay);
  })

  const countShortEvents = maxCountEventsInDay - dayEventsPositionY.length; // 단기 이벤트 수 계산

  const maxCountLongEvents = isShowMoreBtn ? maxCountEventsInDay - 1 : maxCountEventsInDay; // 장기 이벤트 최대 수 계산

  const countLongEvents = dayEventsPositionY.slice(0, maxCountLongEvents).reduce((total, _) => total + 1, 0); // 장기 이벤트 수 계산

  const restCountEvents = dayShortEvents.length + dayLongEvents.length - countLongEvents; // 나머지 이벤트 수 계산
  
  const styleForMoreBtn = { top: (maxCountEventsInDay - 1) * 24 }; // 더보기 버튼 스타일 계산

  const handleCreateEvent = () => { // 이벤트 생성 핸들러
    const { hours, minutes } = createDate({ date: new Date() });
    const startMins = getNextStartMinutes(minutes);
    const selectedDate = shmoment(day.date).add('hours', hours).add('minutes', minutes + startMins).result();

    openModalCreate({ selectedDate, type: 'long-event' })
  }

  const handleShowModalDayInfo = (e: MouseEvent<HTMLButtonElement>) => { // 모달 정보 표시 핸들러
    e.stopPropagation();
    openModalDayInfo(day.date);
  }
  
  return (
    <div
      className={styles.day}
      onClick={handleCreateEvent} // 날짜 클릭 시 이벤트 생성 핸들러 호출
    >
      <div className={cn(styles.day__label, {
        [styles.day__label_active]: checkIsToday(day.date), // 오늘 날짜인 경우 스타일 적용
        [styles.day__label_additional]: day.monthIndex !== selectedMonth.monthIndex // 선택된 월이 아닌 경우 스타일 적용
      })}>
        {day.dayNumber === 1
          ? `${day.dayNumber} ${day.monthShort}` // 월의 첫 날짜에는 날짜와 월 표시
          : day.dayNumber // 그 외 날짜는 날짜만 표시
        }
      </div>
      <div className={styles.day__events}>
        {dayEventsPositionY.slice(0, maxCountLongEvents).map((eventId, indx) => {
          const event = dayLongEvents.find(event => event.id === eventId); // 이벤트 ID로 장기 이벤트 검색
          const { width, isShowEvent, isMovingFromPrev, isMovingToNext } = getStyledForLongEvent(weekDays, day, event); // 장기 이벤트 스타일 계산
          const top = indx * 24; // 이벤트 위치 계산

          return (
            <LongEvent
              key={event.id} // 각 이벤트의 고유 키
              event={event} // 이벤트 데이터
              width={width} // 이벤트의 너비
              top={top} // 이벤트의 상단 위치
              color={event.color} // 이벤트의 색상
              isShowEvent={isShowEvent} // 이벤트 표시 여부
              isMovingToNext={isMovingToNext} // 다음 날짜로 이동 중인지 여부
              isMovingFromPrev={isMovingFromPrev} // 이전 날짜에서 이동 중인지 여부
            />
          );
        })}
        {!isShowMoreBtn && (
          dayShortEvents.slice(0, countShortEvents).map((event, indx) => {
            const top = (dayEventsPositionY.length + indx) * 24; // 단기 이벤트 위치 계산
            return (
              <ShortEvent
                key={event.id}
                event={event}
                top={top}
              />
            )
          })
        )}
        {isShowMoreBtn && (
          <button
            className={styles.day__more__btn}
            style={styleForMoreBtn} // 더보기 버튼 스타일 설정
            onClick={handleShowModalDayInfo} // 더보기 버튼 클릭 시 모달 정보 표시 핸들러 호출
          >
            {/* More // 나머지 이벤트 수 표시 */}
            {restCountEvents}
          </button>
        )}
      </div>
    </div>
  );
}

export default Day;
