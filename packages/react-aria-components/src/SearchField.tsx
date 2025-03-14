/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {AriaSearchFieldProps, useFocusRing, useSearchField} from 'react-aria';
import {ButtonContext} from './Button';
import {ContextValue, forwardRefType, Provider, RenderProps, SlotProps, useContextProps, useRenderProps, useSlot} from './utils';
import {filterDOMProps} from '@react-aria/utils';
import {InputContext} from './Input';
import {LabelContext} from './Label';
import React, {createContext, ForwardedRef, forwardRef, useRef} from 'react';
import {SearchFieldState, useSearchFieldState} from 'react-stately';
import {TextContext} from './Text';

export interface SearchFieldRenderProps {
  /**
   * The current value of the search field.
   */
  value: string,
  /**
   * Whether the search field is empty.
   * @selector [data-empty]
   */
  isEmpty: boolean,
  /**
   * Whether the search field is focused, either via a mouse or keyboard.
   * @selector [data-focused]
   */
  isFocused: boolean,
  /**
   * Whether the search field is keyboard focused.
   * @selector [data-focus-visible]
   */
  isFocusVisible: boolean,
  /**
   * Whether the search field is disabled.
   * @selector [data-disabled]
   */
  isDisabled: boolean,
  /**
   * State of the search field.
   */
  state: SearchFieldState
}

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, 'label' | 'placeholder' | 'description' | 'errorMessage'>, RenderProps<SearchFieldRenderProps>, SlotProps {}

export const SearchFieldContext = createContext<ContextValue<SearchFieldProps, HTMLDivElement>>(null);

function SearchField(props: SearchFieldProps, ref: ForwardedRef<HTMLDivElement>) {
  [props, ref] = useContextProps(props, ref, SearchFieldContext);
  let inputRef = useRef<HTMLInputElement>(null);
  let [labelRef, label] = useSlot();
  let state = useSearchFieldState(props);
  let {focusProps, isFocused, isFocusVisible} = useFocusRing({within: true});
  let {labelProps, inputProps, clearButtonProps, descriptionProps, errorMessageProps} = useSearchField({
    ...props,
    label
  }, state, inputRef);

  let renderProps = useRenderProps({
    ...props,
    values: {
      value: state.value,
      isEmpty: state.value === '',
      isFocused,
      isFocusVisible,
      isDisabled: props.isDisabled || false,
      state
    },
    defaultClassName: 'react-aria-SearchField'
  });

  let DOMProps = filterDOMProps(props);
  delete DOMProps.id;

  return (
    <div
      {...DOMProps}
      {...focusProps}
      {...renderProps}
      ref={ref}
      slot={props.slot}
      data-empty={state.value === '' || undefined}
      data-focused={isFocused || undefined}
      data-focus-visible={isFocusVisible || undefined}
      data-disabled={props.isDisabled || undefined}>
      <Provider
        values={[
          [LabelContext, {...labelProps, ref: labelRef}],
          [InputContext, {...inputProps, ref: inputRef}],
          [ButtonContext, clearButtonProps],
          [TextContext, {
            slots: {
              description: descriptionProps,
              errorMessage: errorMessageProps
            }
          }]
        ]}>
        {renderProps.children}
      </Provider>
    </div>
  );
}

/**
 * A search field allows a user to enter and clear a search query.
 */
const _SearchField = /*#__PURE__*/ (forwardRef as forwardRefType)(SearchField);
export {_SearchField as SearchField};
