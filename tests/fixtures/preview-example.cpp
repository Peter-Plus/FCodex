// FC-009 preview refresh check: status icon style check - 2026-10-23T22:16:00.754Z
#include <algorithm>
#include <iostream>
#include <string>
#include <vector>

struct Student {
    std::string name;
    int score;
};

int main() {
    std::vector<Student> students = {
        {"Alice", 92},
        {"Bob", 85},
        {"Charlie", 97},
    };

    // Sort by score, highest first.
    std::sort(students.begin(), students.end(),
              [](const Student& left, const Student& right) {
                  return left.score > right.score;
              });

    std::cout << "Student ranking\n";
    for (const auto& student : students) {
        std::cout << student.name << ": " << student.score << '\n';
    }

    return 0;
}
