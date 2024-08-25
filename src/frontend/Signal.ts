/*
 * Copyright (c) Mike Lischke. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 */

interface IWaiter<T> {
    timeout: ReturnType<typeof setTimeout> | null;
    resolve: (noRemove: boolean, value?: T) => void;
}

type SignalResult<T> = T extends undefined ? boolean : T extends void ? boolean : T;

/**
 * A class that allows signal and wait operations.
 *
 * @param T The type of the value that is passed to the waiters.
 */
export class Signal<T = void> {
    // The list of waiters (promises) that are waiting for a notification.
    #waiters: Array<IWaiter<T>> = [];

    /**
     * Adds a new waiter to the semaphore, to be notified when one of the notification methods is called.
     *
     * @param timeout An optional timeout value (in milliseconds).
     *
     * @returns A promise that resolves to true if triggered by a notification, otherwise false (in case of a timeout).
     *          If a value was specified in the notification, the promise resolves to that value.
     */
    public wait(timeout?: number): Promise<SignalResult<T>> {
        const waiter: IWaiter<T> = { timeout: null, resolve: () => { /**/ } };
        this.#waiters.push(waiter);
        const promise = new Promise<SignalResult<T>>((resolve) => {
            let resolved = false;
            waiter.resolve = (noRemove: boolean, value?: T) => {
                if (resolved) {
                    return;
                }

                resolved = true;
                if (waiter.timeout) {
                    clearTimeout(waiter.timeout);
                    waiter.timeout = null;
                }

                if (!noRemove) {
                    const pos = this.#waiters.indexOf(waiter);
                    if (pos > -1) {
                        this.#waiters.splice(pos, 1);
                    }
                }

                if (value === undefined) {
                    resolve(true as SignalResult<T>);
                } else {
                    resolve(value as SignalResult<T>);
                }
            };
        });

        if (timeout !== undefined && timeout > 0 && isFinite(timeout)) {
            waiter.timeout = setTimeout(() => {
                waiter.timeout = null;
                waiter.resolve(false);
            }, timeout);
        }

        return promise;
    }

    /**
     * Notifies one waiter and removes that from the internal list of waiters.
     *
     * @param value An optional value that is passed to the waiter.
     */
    public notify(value?: T): void {
        const waiter = this.#waiters.pop();
        waiter?.resolve(true, value);
    }

    /**
     * Notifies all waiters in reverse order and clears the internal list.
     *
     * @param value An optional value that is passed to the waiters.
     */
    public notifyAll(value?: T): void {
        const list = this.#waiters.reverse();
        this.#waiters = [];

        let waiter;
        while ((waiter = list.pop()) !== undefined) {
            waiter.resolve(true, value);
        }
    }
}
