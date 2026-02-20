import { Utils } from '@rterizz23/peyek-core';

/**
 * P.E.Y.E.K UI Builder - Default Components
 */
export const Components = {
    text: {
        name: 'Text Block',
        icon: 'T',
        render: () => {
            return Utils.createElement('div', {
                className: 'peyek-component peyek-comp-text',
                contentEditable: 'true',
                style: {
                    padding: '10px',
                    fontFamily: 'sans-serif',
                    minHeight: '20px',
                    border: '1px dashed transparent',
                    outline: 'none'
                }
            }, ['Double click to edit text']);
        }
    },

    heading: {
        name: 'Heading',
        icon: 'H',
        render: () => {
            return Utils.createElement('h2', {
                className: 'peyek-component peyek-comp-heading',
                contentEditable: 'true',
                style: {
                    padding: '10px',
                    fontFamily: 'sans-serif',
                    margin: '0',
                    outline: 'none'
                }
            }, ['Heading Text']);
        }
    },

    button: {
        name: 'Button',
        icon: 'B',
        render: () => {
            return Utils.createElement('button', {
                className: 'peyek-component peyek-comp-button',
                contentEditable: 'true',
                style: {
                    padding: '10px 20px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontFamily: 'sans-serif'
                }
            }, ['Button']);
        }
    }
};
