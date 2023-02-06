import React from 'react';
import { shallow } from 'enzyme';
import {
    renderTransformer,
    TabGeneralComponent as TabGeneral,
} from './TabGeneral';
import TransformerList from '../transformers/TransformerList';
import SourceValueToggleConnected from '../sourceValue/SourceValueToggle';

describe('TabGeneral', () => {
    describe('renderTransformer', () => {
        it('should not render TransformerList if locked prop is truthy', () => {
            const Component = renderTransformer(true, true, false, {
                t: key => key,
            });
            const element = shallow(<Component />);

            expect(element.find(TransformerList).exists()).toBeFalsy();
        });

        it('should render TransformerList if locked prop is falsy', () => {
            const Component = renderTransformer(false, true, false, {
                t: key => key,
            });
            const element = shallow(<Component />);

            expect(element.find(TransformerList).exists()).toBeTruthy();
        });

        it('shoud pass 3 as hideFirstTransformers value to TransformerList if isSubresourceField is truthy and isArbitrary is falsy', () => {
            const Component = renderTransformer(false, true, false, {
                t: key => key,
            });
            const element = shallow(<Component />);

            expect(
                element.find(TransformerList).prop('hideFirstTransformers'),
            ).toBe(3);
        });

        it('shoud pass 0 as hideFirstTransformers value to TransformerList if isSubresourceField is truthy and isArbitrary is truthy', () => {
            const Component = renderTransformer(false, true, true, {
                t: key => key,
            });
            const element = shallow(<Component />);

            expect(
                element.find(TransformerList).prop('hideFirstTransformers'),
            ).toBe(0);
        });

        it('shoud pass 0 as hideFirstTransformers value to TransformerList if isSubresourceField is falsy', () => {
            const Component = renderTransformer(false, false, false, {
                t: key => key,
            });

            const element = shallow(<Component />);

            expect(
                element.find(TransformerList).prop('hideFirstTransformers'),
            ).toBe(0);
        });

        it('shoud spread other props to TransformerList', () => {
            const Component = renderTransformer(false, true, false, {
                t: key => key,
            });

            const element = shallow(<Component foo="bar" cov="fefe" />);

            expect(element.find(TransformerList).props()).toEqual({
                cov: 'fefe',
                foo: 'bar',
                hideFirstTransformers: 3,
            });
        });
    });
    describe('SourceValue', () => {
        const defaultProps = {
            subresourceUri: undefined,
            tranformersLocked: false,
        };

        it('should render TabGeneral with all values when is resource field', () => {
            const wrapper = shallow(<TabGeneral {...defaultProps} />);
            expect(wrapper.find(SourceValueToggleConnected)).toHaveLength(1);
        });
    });
});
