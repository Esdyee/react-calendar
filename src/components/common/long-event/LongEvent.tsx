import cn from "classnames"; // 클래스 이름 조건부 결합을 위한 라이브러리
import { usePopup } from "hooks/usePopup"; // 팝업 관련 커스텀 훅
import React, { FC, MouseEvent } from "react"; // React 기본 및 타입
import { IEvent } from "types/event"; // 이벤트 타입
import { formatDate } from "utils/date"; // 날짜 포맷팅 유틸리티

import styles from './long-event.module.scss'; // 스타일 모듈

interface ILongEventProps { // 컴포넌트 props 타입
  event: IEvent;
  width: number;
  top: number;
  color: string;
  isShowEvent: boolean;
  isMovingToNext: boolean;
  isMovingFromPrev: boolean;
}

const LongEvent: FC<ILongEventProps> = ({ // 컴포넌트 정의
  event,
  width,
  top,
  color,
  isShowEvent,
  isMovingToNext,
  isMovingFromPrev
}) => {
  const { openPopup } = usePopup(); // 팝업 훅 사용
  const eventStyle = { // 이벤트 스타일 계산
    width: `calc(${width}% - 2%)`,
    top: `${top}px`,
    opacity: isShowEvent ? 1 : 0,
    zIndex: isShowEvent ? 1 : -1
  };

  const eventContainerStyle = { background: color }; // 이벤트 컨테이너 스타일
  const arrowLeftStyle = { borderRightColor: color }; // 왼쪽 화살표 스타일
  const arrowRightStyle = { borderLeftColor: color }; // 오른쪽 화살표 스타일

  const handleOpenModal = (e: MouseEvent<HTMLDivElement>) => { // 모달 오픈 핸들러
    const { clientX, clientY } = e;
    e.stopPropagation();
    openPopup({
      x: clientX,
      y: clientY,
      eventId: event.id
    });
  }

  return (
    <div
      className={cn(styles.event, {
        [styles.event_left]: isMovingFromPrev, // 이전 날짜에서 이동 중인 경우 스타일 적용
        [styles.event_right]: isMovingToNext, // 다음 날짜로 이동 중인 경우 스타일 적용
      })}
      style={eventStyle} // 이벤트 스타일 적용
      onClick={handleOpenModal} // 클릭 시 모달 오픈 핸들러 호출
    >
      <div
        className={styles.event__container}
        style={eventContainerStyle} // 이벤트 컨테이너 스타일 적용
      >
        {event.title} // 이벤트 제목 표시
        {event.type === 'event' && (
          `, ${formatDate(new Date(event.start), 'hh:mm')}` // 이벤트 시작 시간 표시
        )}
        {isMovingFromPrev && (
          <div
            className={cn(styles.event__arrow, styles.event__arrow_left)} // 왼쪽 화살표 스타일 적용
            style={arrowLeftStyle} // 왼쪽 화살표 색상 적용
          ></div>
        )}
        {isMovingToNext && (
          <div
            className={cn(styles.event__arrow, styles.event__arrow_right)} // 오른쪽 화살표 스타일 적용
            style={arrowRightStyle} // 오른쪽 화살표 색상 적용
          ></div>
        )}
      </div>
    </div>
  );
}

export default LongEvent;