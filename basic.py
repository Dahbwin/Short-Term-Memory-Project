import time
import os
from typing import List, Tuple
import logger_sqlite as logger
from game_core import WORDS, generate_sequence, convert_user_input, check_answer

# ==== Funções ====

def clear_screen():
    """Limpa a tela do terminal"""
    os.system('cls' if os.name == 'nt' else 'clear')

def start_screen():
    """Exibe a tela inicial piscando"""
    text = "=== START GAME ==="
    try:
        for _ in range(4):
            clear_screen()
            time.sleep(0.3)
            print(text)
            time.sleep(0.3)
    except KeyboardInterrupt:
        # Usuário cancelou o splash (Ctrl+C). Limpa a tela e continua o jogo.
        clear_screen()
        try:
            logger.log("start_screen interrupted by user", level="INFO")
        except Exception:
            pass
        return
    clear_screen()

def choose_level() -> Tuple[int, int, int]:
    """Pergunta ao usuário o nível e retorna min, max e intervalo de palavras"""
    difficulties = {
        '1': {'min': 4, 'max': 6, 'word_interval': 2},
        '2': {'min': 7, 'max': 10, 'word_interval': 2},
        '3': {'min': 11, 'max': 15, 'word_interval': 3},
        '4': {'min': 16, 'max': 20, 'word_interval': 4},
    }
    while True:
        choice = input("Choose difficulty (1=Easy, 2=Medium, 3=Hard, 4=Very Hard): ")
        if choice in difficulties:
            level = difficulties[choice]
            logger.log(f"User selected difficulty: {choice}", level="INFO")
            return level['min'], level['max'], level['word_interval']
        else:
            print("Invalid option. Try again.")


def show_sequence(seq: List):
    """Mostra a sequência na tela, elemento por elemento"""
    logger.log(f"Showing sequence of {len(seq)} items to user", level="DEBUG")
    for i, item in enumerate(seq):
        print(item)
        time.sleep(2)  # espera 2 segundos antes de limpar
        clear_screen()

def get_user_input() -> List:
    """Recebe e converte a entrada do usuário via terminal.

    Esta função delega a conversão a `game_core.convert_user_input` para manter
    consistência com outras interfaces que possam reaproveitar a lógica.
    """
    resposta = input("Enter the sequence you memorized, separated by commas: ")
    logger.log(f"User raw input: {resposta}", level="DEBUG")
    return convert_user_input(resposta)

# use check_answer from game_core

# ==== Loop principal ====

def main():
    logger.init_db()
    try:
        start_screen()
    except KeyboardInterrupt:
        logger.log("start_screen interrupted before game start", level="INFO")
        print("Interrupted. Exiting.")
        return
    last_level = None

    try:
        while True:
            # Escolha do nível
            if last_level is None:
                minimum, maximum, word_interval = choose_level()
            else:
                minimum, maximum, word_interval = last_level

            # Gera e mostra sequência
            sequencia_mista, gabarito = generate_sequence(minimum, maximum, WORDS, word_interval)
            print(f"Try to memorize {len(sequencia_mista)} items:")
            time.sleep(2)
            clear_screen()
            show_sequence(sequencia_mista)

            start_time = time.time()
            # Input do usuário
            user_answer = get_user_input()
            end_time = time.time()
            elapsed = end_time - start_time
            print(f"You took {elapsed:.2f} seconds to answer.")
            logger.log(f"Round finished: time={elapsed:.2f}s, items={len(sequencia_mista)}, user_answer={user_answer}", level="INFO")

            # Checa resposta (usa lógica centralizada em game_core)
            correct, errors, details = check_answer(user_answer, gabarito)
            if correct:
                print("Congratulations! You got it all correct!")
            else:
                print("\n Sorry, that's incorrect. The correct sequence was:", gabarito)

            for u, c, ok in details:
                print(u, "->", c, "<--" + (" ✅" if ok else " ❌"))

            # Persistir resultado estruturado para análise posterior
            try:
                metadata = {"time": elapsed, "items": len(sequencia_mista)}
                data = {"items": sequencia_mista, "answer": user_answer, "details": details, "correct": correct}
                logger.save_round(metadata, data)
            except Exception:
                logger.log("Failed saving round to DB", level="ERROR")

            # Repetir ou mudar nível
            escolha = input("Repeat? (yy=same level, y=choose level, n=exit): ").lower()
            if escolha == 'yy':
                last_level = (minimum, maximum, word_interval)
                clear_screen()
            elif escolha == 'y':
                last_level = None
                clear_screen()
            elif escolha == 'n':
                logger.log("User chose to exit the game", level="INFO")
                print("Thanks for playing!")
                break
            else:
                print("Invalid input. Exiting.")
                break
    except KeyboardInterrupt:
        logger.log("Program interrupted by user", level="INFO")
        print("\nInterrupted. Exiting.")
    

if __name__ == "__main__":
    main()