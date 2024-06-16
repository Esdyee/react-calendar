import React, { ChangeEvent, FC, useRef } from 'react'; // React와 필요한 훅들 import
import { useClickOutside, useForm } from 'hooks/index'; // 커스텀 훅들 import
import { checkDateIsEqual, getDateTime, getDifferenceInTimeFromTwoTimes, getDifferenceOfTwoDates, shmoment } from 'utils/date'; // 날짜 관련 유틸리티 함수들 import
import { TSubmitHandler } from 'hooks/useForm/types'; // 타입 import
import { createEventSchema } from 'validation-schemas/index'; // 이벤트 스키마 import
import { IModalValues } from './types'; // 타입 import
import { TPartialEvent } from 'types/event'; // 타입 import
import { TextField, DatePicker, TimePicker, ColorPicker } from 'components/common/form-elements'; // 폼 요소들 import
import cn from 'classnames'; // 클래스네임 유틸리티 import

import styles from './modal-form-event.module.scss'; // 스타일 import

interface IModalFormEventProps { // 컴포넌트 props 타입 정의
  textSendButton: string;
  textSendingBtn: string;
  defaultEventValues: IModalValues;
  closeModal: () => void;
  handlerSubmit: (eventData: TPartialEvent) => void;
}

const ModalFormEvent: FC<IModalFormEventProps> = ({ // 컴포넌트 정의
  textSendButton,
  textSendingBtn,
  closeModal,
  defaultEventValues,
  handlerSubmit
}) => {
  const modalRef = useRef<HTMLDivElement>(); // 모달 참조

  const { values, handleChange, handleSubmit, setValue, errors, submitting } = useForm<IModalValues>({ // 폼 훅 사용
    defaultValues: defaultEventValues,
    rules: createEventSchema
  });

  const isValid = Object.keys(errors).length === 0; // 유효성 검사

  const onSelectStartDate = (date: Date) => { // 시작 날짜 선택 핸들러
    if (values.isLongEvent) {
      const { minutes } = getDifferenceOfTwoDates(values.startDate, values.endDate);
      const newEndDate = shmoment(date).add('minutes', minutes).result();
      
      setValue('endDate', newEndDate);
      setValue('startDate', date);
      return;
    }

    const oldStartDate = getDateTime(values.startDate, values.startTime); // 기존 시작 날짜와 시간을 결합하여 DateTime 객체 생성
    const newStartDate = getDateTime(date, values.startTime); // 새로운 시작 날짜와 기존 시작 시간을 결합하여 DateTime 객체 생성
    const { minutes } = getDifferenceOfTwoDates(oldStartDate, values.endDate); // 기존 시작 날짜와 종료 날짜 사이의 시간 차이(분) 계산
    const newEndDate = shmoment(newStartDate).add('minutes', minutes).result(); // 새로운 시작 날짜에 시간 차이를 더하여 새로운 종료 날짜 계산

    setValue('endDate', newEndDate);
    setValue('startDate', newStartDate);
  }

  const onSelectEndDate = (date: Date) => { // 종료 날짜 선택 핸들러
    const endTime = values.isLongEvent ? '23:59' : values.endTime;
    setValue('endDate', getDateTime(date, endTime));
  }

  const onSelectStartTime = (time: string) => { // 시작 시간 선택 핸들러
    const [startHours, startMins] = time.split(':');
    const { hours, minutes } = getDifferenceOfTwoDates(values.startDate, values.endDate);
    const restHourFromDiff = (+startMins + (minutes % 60)) >= 60  ? 1 : 0;
    
    const newEndMins = ((+startMins + minutes) % 60).toString().padStart(2, '0');
    const newEndHours = ((+startHours + Math.floor(hours) + restHourFromDiff) % 24).toString().padStart(2, '0');
    
    const newEndTime = `${newEndHours}:${newEndMins}`;
    const newEndDate = shmoment(getDateTime(values.startDate, time)).add('minutes', minutes).result();
    
    setValue('startTime', time);
    setValue('endTime', newEndTime);
    setValue('endDate', newEndDate);
    setValue('startDate', getDateTime(values.startDate, time));
  }

  const onSelectEndTime = (time: string) => { // 종료 시간 선택 핸들러
    const isDatesEqual = checkDateIsEqual(values.startDate, values.endDate);
    const {
      minutes
    } = (isDatesEqual || !!errors.endDate)
    ? getDifferenceInTimeFromTwoTimes(values.startTime, time)
    : getDifferenceOfTwoDates(values.startDate, getDateTime(values.endDate, time));
    const newEndDate = shmoment(getDateTime(values.startDate, values.startTime)).add('minutes', minutes).result();

    setValue('endTime', time);
    setValue('endDate', newEndDate);
  }

  // 색상 변경 핸들러
  const onChangeColor = (color: string) => setValue('color', color);

  // 장기 이벤트 토글 핸들러
  const onToggleIsLongEvent = (e: ChangeEvent<HTMLInputElement>) => {
    const isLongEvent = e.target.checked;
    const startTime = isLongEvent ? '00:00' : values.startTime;
    const endTime = isLongEvent ? '23:59' : values.endTime;
    
    setValue('isLongEvent', isLongEvent); // 장기 이벤트 여부 설정
    setValue('startDate', getDateTime(values.startDate, startTime)); // 새로운 시작 날짜와 시간 설정
    setValue('endDate', getDateTime(values.endDate, endTime)); // 새로운 종료 날짜와 시간 설정
  }

  // 이벤트 생성 핸들러
  const onSubmit: TSubmitHandler<IModalValues> = async (data) => {
    const newEvent: TPartialEvent = {
      title: data.title, // 이벤트 제목
      description: data.description, // 이벤트 설명
      start: data.startDate.toString(), // 이벤트 시작 날짜
      end: data.endDate.toString(), // 이벤트 종료 날짜
      type: data.isLongEvent ? 'long-event' : 'event', // 이벤트 유형 (장기 이벤트 여부에 따라 결정)
      color: data.color // 이벤트 색상
    };

    await handlerSubmit(newEvent);
    closeModal();
  }
  
  useClickOutside(modalRef, closeModal); // 모달 외부 클릭 시 닫기
  
  return (
    <div className="overlay">
      <div className={styles.modal} ref={modalRef}>
        <div className={styles.modal__content}>
          <button
            className={styles.modal__content__close}
            onClick={closeModal}
          >
            <i className="fas fa-times"></i>
          </button>
          <form
            className={styles.modal__form}
            onSubmit={handleSubmit(onSubmit)}
          >
            <TextField
              type="text"
              name="title"
              placeholder="Title"
              onChange={handleChange}
              value={values.title}
              error={errors.title}
              className={styles.modal__form__title}
              fullWidth
            />
              <div className={cn(styles.modal__form__date, styles.modal__form__group)}>
                <DatePicker
                  selectedDate={values.startDate}
                  selectDate={onSelectStartDate}
                  error={errors.startDate}
                />
                {!values.isLongEvent && (
                  <div className={styles.modal__form__time}>
                    <TimePicker
                      timeFrom='00:00'
                      selectedTime={values.startTime}
                      selectTime={onSelectStartTime}
                      isFullDay
                      error={errors.startTime}
                    />
                    <span>-</span>
                    <TimePicker
                      timeFrom={values.startTime}
                      selectedTime={values.endTime}
                      selectTime={onSelectEndTime}
                      isToday={checkDateIsEqual(values.startDate, values.endDate)}
                      error={errors.endTime ?? errors.endDate}
                    />
                  </div>
                )}
                {values.isLongEvent && <div>-</div>}
                <div>
                  <DatePicker
                    selectedDate={values.endDate}
                    selectDate={onSelectEndDate}
                    error={errors.endDate}
                  />
                </div>
              </div>
              {(!!errors.startDate || !!errors.endDate || !!errors.startTime || !!errors.endTime) && (
                <div className={styles.modal__form__error}>
                  {(errors.startDate ?? errors.endDate ?? errors.startTime ?? errors.endTime)}
                </div>
              )}
            <div className={cn(styles.modal__form__checkbox__container, styles.modal__form__group)}>
              <label htmlFor="type">
                <input
                  type="checkbox"
                  name="type"
                  id="type"
                  onChange={onToggleIsLongEvent}
                  checked={values.isLongEvent}
                />
                <span className={styles.modal__form__checkbox__title}>All day</span>
              </label>
            </div>
            <div className={styles.modal__form__group}>
              <ColorPicker
                selectedColor={values.color}
                onChangeColor={onChangeColor}
              />
            </div>
            <div className={cn(styles.modal__form__textarea__container, styles.modal__form__group)}>
              <textarea
                name="description"
                placeholder="Description"
                className={styles.modal__form__textarea}
                onChange={handleChange}
                value={values.description}
              />
            </div>
            <button
              type="submit"
              className={styles.modal__form__btn}
              disabled={submitting || !isValid}
            >
              {submitting ? textSendingBtn : textSendButton} 이벤트
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ModalFormEvent; // 컴포넌트 export
